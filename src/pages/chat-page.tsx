import styled from '@emotion/styled'
import { PersonIcon } from '@radix-ui/react-icons'
import {
    Message,
    ScrollableContainer,
    NewMessageAlert,
    LoadingSpinner
} from '../components/index.js'
import { useEffect, useState, useContext, useRef } from 'react'
import { messageService, SavedMessage } from '../services/index.js'
import { UserContext } from '../contexts/index.js'
import { useVirtualizer } from '@tanstack/react-virtual'

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    height: 100vh;
`

const PersonInfoArea = styled.div`
    display: flex;
    align-items: center;
    padding: 10px;
    background-color: #f0f0f0;
    border-bottom: 1px solid #ccc;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 30px;
    span {
        margin-left: 10px;
        font-weight: bold;
        color: #333;
    }
    svg {
        width: 24px;
        height: 24px;
        color: #007bff;
        flex-shrink: 0;
    }
`

const InputArea = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    background-color: #f0f0f0;
    border-top: 1px solid #ccc;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 30px;

    input {
        flex: 1;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 4px;
    }
    button {
        margin-left: 10px;
        padding: 10px 15px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        &:hover {
            background-color: #0056b3;
        }
    }
`

// @TODO modify webkit-scrollbar usage for prod / check user base
const MessageArea = styled(ScrollableContainer)`
    margin-top: 60px;
    margin-bottom: 45px;
    overflow-y: auto;
    ::-webkit-scrollbar {
        display: none;
    }
`

const VirtualizerParent = styled.div<{ rowVirtualizerHeight: number }>`
    position: relative;
    height: ${(props) => props.rowVirtualizerHeight+15}px;
    width: 100%;
    overflow: auto;
    ::-webkit-scrollbar {
        display: none;
    }
`

enum SystemMessageType {
    OLDEST_MESSAGE_REACHED = 'oldest_message_reached',
}

interface SystemMessage {
    type: SystemMessageType
}

export function ChatPage() {
    const [targetEmail, setTargetEmail] = useState<string | null>(
        'kdyz1997extra@gmail.com'
    )
    const [messageGroupId, setMessageGroupId] = useState<string | null>(null)
    const messageFetchSize = 25
    const [user, setUser] = useState({
        email: 'kzapra@gmail.com',
    })
    const logout = () => {
        console.log('logout clicked')
    }
    // const { user, logout } = useContext(UserContext)
    const [showNewMessageAlert, setShowNewMessageAlert] = useState(false)
    const [oldestMessageReached, setOldestMessageReached] = useState(false)
    const [hasScrolled, setHasScrolled] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [previousMessageCount, setPreviousMessageCount] = useState(0)

    const [messages, setMessages] = useState<(SavedMessage | SystemMessage)[]>(
        []
    )
    const [messageText, setMessageText] = useState('')

    const parentRef = useRef(null)

    const rowVirtualizer = useVirtualizer({
        count: messages.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 25,
        measureElement: (el) => {
            return el.getBoundingClientRect().height
        },
        overscan: 5,
    })

    const isUserNearBottom = () => {
        const el = parentRef.current
        if (!el) return false
        return el.scrollHeight - el.scrollTop - el.clientHeight < 100
    }

    useEffect(() => {

        if (hasScrolled && messages.length > previousMessageCount) {
            const aaaa = (messages.length - previousMessageCount) + 4
            console.log('messages changed', hasScrolled, aaaa)
            rowVirtualizer.scrollToIndex(aaaa, {
                align: 'start',
            })
            setPreviousMessageCount(messages.length)
            return
        }
        
        if (hasScrolled || !messages.length) {
            return
        }

        scrollToBottom()

        requestAnimationFrame(() => {
            setHasScrolled(true)
        })
    }, [rowVirtualizer.getVirtualItems().length, messages.length])

    const handleSendMessage = async (text: string) => {
        if (!messageGroupId || !text.trim()) {
            return
        }
        const trimmedText = text.trim()
        await messageService.addMessageToGroup(messageGroupId, {
            text: trimmedText,
            senderEmail: user.email,
        })
    }

    const handleNewMessage = (message: SavedMessage) => {
        setMessages((previousMessages) => [message, ...previousMessages])
    }

    const handleScrollTop = async () => {
        if (oldestMessageReached) {
            return
        }
        setIsLoading(true)
        const fetchedMessages = await messageService.browseMessagesByGroupId(
            messageGroupId,
            2,
            (messages[messages.length - 1] as SavedMessage).id
        )

        setIsLoading(false)

        if (!fetchedMessages.length) {
            setMessages([
                ...messages,
                { type: SystemMessageType.OLDEST_MESSAGE_REACHED },
            ])
            setOldestMessageReached(true)
            return
        }

        setMessages([...messages, ...fetchedMessages])
    }

    const scrollToBottom = () => {
        rowVirtualizer.scrollToIndex(messages.length - 1, {
            align: 'end',
        })
        setShowNewMessageAlert(false)
    }

    useEffect(() => {
        const isNearBottom = isUserNearBottom()
        if (isNearBottom) {
            scrollToBottom()
            return
        }
        setShowNewMessageAlert(true)
    }, [messages.length])

    useEffect(() => {
        if (!targetEmail) {
            setMessages([])
            return
        }
        const getMessageGroupId = async () => {
            const messageGroup =
                await messageService.readMessageGroupByMemberEmails([
                    user.email,
                    targetEmail,
                ])
            if (!messageGroup) {
                await messageService.addMessageGroup({
                    memberEmails: [user.email, targetEmail],
                })
                return
            }
            setMessageGroupId(messageGroup.id)
            const fetchedMessages =
                await messageService.browseMessagesByGroupId(
                    messageGroup.id,
                    messageFetchSize
                )
            setMessages(fetchedMessages)
        }
        getMessageGroupId()
    }, [targetEmail])

    useEffect(() => {
        if (!messageGroupId) {
            setMessages([])
            return
        }
        return messageService.listenForNewMessages(
            messageGroupId,
            handleNewMessage
        )
    }, [messageGroupId])

    return (
        <Wrapper>
            <PersonInfoArea>
                <label>
                    current email
                    <input
                        type="text"
                        onBlur={(event) => {
                            const email = event.target.value.trim()
                            setUser({ email: email })
                        }}
                    />
                </label>
                <label>
                    target email
                    <input
                        onBlur={(event) => {
                            const email = event.target.value.trim()
                            setTargetEmail(email || null)
                        }}
                        type="text"
                        placeholder="Enter email"
                    />
                </label>
                <button onClick={logout}>logout</button>
            </PersonInfoArea>
            {/* <LoadingSpinner /> */}
            {isLoading && <LoadingSpinner />}

            {targetEmail ? (
                <MessageArea ref={parentRef} onHitTop={handleScrollTop} onHitBottom={() => {
                    setShowNewMessageAlert(false)
                }}>
                    <VirtualizerParent
                        rowVirtualizerHeight={rowVirtualizer.getTotalSize()}
                    >
                        {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                            const reverseIndex =
                                messages.length - 1 - virtualItem.index

                            const message = messages[reverseIndex]
                            const isSystemMessage =
                                (message as SystemMessage).type !== undefined
                            return (
                                <div
                                    key={virtualItem.index}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: `${virtualItem.size}px`,
                                        transform: `translateY(${virtualItem.start}px)`,
                                    }}
                                >
                                    {isSystemMessage ? (
                                        <div>oldest message reached</div>
                                    ) : (
                                        <Message
                                            ref={rowVirtualizer.measureElement}
                                            key={(message as SavedMessage).id}
                                            text={
                                                (message as SavedMessage).text
                                            }
                                            isFromCurrentUser={
                                                (message as SavedMessage)
                                                    .senderEmail === user.email
                                            }
                                            index={virtualItem.index}
                                            timestamp={new Date(
                                                (
                                                    message as SavedMessage
                                                ).createdAt.toDate()
                                            ).toLocaleTimeString()}
                                        />
                                    )}
                                </div>
                            )
                        })}
                    </VirtualizerParent>
                </MessageArea>
            ) : undefined}
            {targetEmail ? (
                <InputArea>
                    <input
                        onChange={(event) => {
                            event.preventDefault()
                            setMessageText(event.target.value)
                        }}
                        type="text"
                        placeholder="Type a message..."
                        value={messageText}
                    />
                    <button
                        onClick={(event) => {
                            event.preventDefault()
                            handleSendMessage(messageText)
                            setMessageText('')
                        }}
                    >
                        Send
                    </button>
                </InputArea>
            ) : (
                <>Select a target email first</>
            )}
            {showNewMessageAlert && <NewMessageAlert onClick={scrollToBottom} />}            
        </Wrapper>
    )
}
