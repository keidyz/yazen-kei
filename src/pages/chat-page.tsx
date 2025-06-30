import styled from '@emotion/styled';
import {
    Message,
    ScrollableContainer,
    NewMessageAlert,
    LoadingSpinner,
    ChatPageHeaderArea,
} from '../components/index.js';
import { useEffect, useState, useRef, useContext } from 'react';
import { messageService, SavedMessage } from '../services/index.js';
import { useVirtualizer, VirtualItem } from '@tanstack/react-virtual';
import { infiniteQueryOptions, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { ChatGroupContext } from '../contexts/chat-group-context.js';
import { Button, TextArea } from '@radix-ui/themes';
import { generate } from 'random-words';
import { UpdateIcon } from '@radix-ui/react-icons';

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    height: 100vh;
`;

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
    height: 55px;
    gap: 10px;
`;

const MessageInput = styled(TextArea)`
    flex: 1;
`;

const OldestMessageReachedNotification = styled.div`
    text-align: center;
`;

// @TODO modify webkit-scrollbar usage for prod / check user base
const MessageArea = styled(ScrollableContainer)`
    margin-top: 45px;
    margin-bottom: 85px;
    overflow-y: auto;
    ::-webkit-scrollbar {
        display: none;
    }
`;

const VirtualizerParent = styled.div<{ virtualizerHeight: number }>`
    position: relative;
    height: ${(props) => props.virtualizerHeight + 15}px;
    overflow: auto;
    ::-webkit-scrollbar {
        display: none;
    }
`;

const VirtualizerItem = styled.div<{ virtualItem: VirtualItem }>`
    position: absolute;
    left: 0;
    right: 0;
    height: ${(props) => props.virtualItem.size}px;
    transform: translateY(${(props) => props.virtualItem.start}px) scaleY(-1);
`;

enum SystemMessageType {
    OLDEST_MESSAGE_REACHED = 'oldest_message_reached',
}

interface SystemMessage {
    type: SystemMessageType;
}
const TANSTACK_QUERY_KEY = 'messages';
const MESSAGE_FETCH_SIZE = 25;

export const ChatPage = () => {
    const { communicationMembers, messageGroup } = useContext(ChatGroupContext);
    const queryClient = useQueryClient();

    const queryOptions = infiniteQueryOptions({
        queryKey: [TANSTACK_QUERY_KEY],
        queryFn: async ({ pageParam: cursor = undefined }) => {
            const fetchedMessages = await messageService.browseMessagesByGroupId(
                messageGroup.id,
                MESSAGE_FETCH_SIZE,
                cursor
            );
            return {
                fetchedMessages: fetchedMessages.length
                    ? fetchedMessages
                    : [
                          {
                              type: SystemMessageType.OLDEST_MESSAGE_REACHED,
                          } as SystemMessage,
                      ],
                nextCursor: fetchedMessages.length
                    ? fetchedMessages[fetchedMessages.length - 1].id
                    : undefined,
            };
        },
        initialPageParam: undefined,
        getNextPageParam: (lastPage) => lastPage && lastPage.nextCursor,
    });

    const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQuery(queryOptions);

    const collectedMessages: (SavedMessage | SystemMessage)[] =
        data?.pages.flatMap((page) => page.fetchedMessages as (SavedMessage | SystemMessage)[]) ||
        [];
    const [messageText, setMessageText] = useState('');
    const previousScrollOffsetRef = useRef<number | null>(null);
    const scrollParentRef = useRef(null);

    const [hasNewFreshMessage, setHasNewFreshMessage] = useState(false);

    const virtualizer = useVirtualizer({
        count: collectedMessages.length,
        getScrollElement: () => scrollParentRef.current,
        estimateSize: () => 25,
        measureElement: (element) => element.getBoundingClientRect().height,
    });

    const isUserNearBottom = () => {
        const element = scrollParentRef.current;
        if (!element) {
            return false;
        }
        return element.scrollTop < 100;
    };

    const virtualItems = virtualizer.getVirtualItems();

    const handleSendMessage = async (text: string) => {
        const trimmedText = text.trim();
        if (!trimmedText) {
            return;
        }
        await messageService.addMessageToGroup(messageGroup.id, {
            text: trimmedText,
            senderDisplayName: communicationMembers.displayName,
        });
    };

    const scrollToBottomAndDisableNewMessageNotification = () => {
        virtualizer.scrollToIndex(0, { align: 'end' });
        setHasNewFreshMessage(false);
    };

    const handleIncomingMessage = (message: SavedMessage) => {
        if (scrollParentRef.current) {
            previousScrollOffsetRef.current =
                scrollParentRef.current.scrollHeight - scrollParentRef.current.scrollTop;
        }
        setHasNewFreshMessage(true);
        queryClient.setQueryData([TANSTACK_QUERY_KEY], (previousData: any) => {
            if (!previousData) {
                return previousData;
            }

            return {
                ...previousData,
                pages: [
                    {
                        fetchedMessages: [
                            message,
                            ...(previousData.pages[0]?.fetchedMessages || []),
                        ],
                        nextCursor: previousData.pages[0]?.nextCursor,
                    },
                    ...previousData.pages.slice(1),
                ],
            };
        });
    };

    useEffect(() => {
        const lastItem = virtualItems[virtualItems.length - 1];
        if (!hasNextPage || isFetchingNextPage || lastItem.index < collectedMessages.length - 1) {
            return;
        }
        fetchNextPage();
    }, [virtualItems, hasNextPage, isFetchingNextPage]);

    useEffect(() => {
        const scrollParentElement = scrollParentRef.current;
        if (!scrollParentElement || previousScrollOffsetRef.current === null) {
            return;
        }

        // @TODO: I'm going crazy.
        // scroll is somewhat jittery whenever a new messages arrives
        // and scroll bar is far from the bottom
        // This is because parent.scrollHeight is not the final size
        // Find a way to wait for everything to render to get the real size and
        // use that measurement to stay in position
        virtualizer.scrollToOffset(
            scrollParentElement.scrollHeight - previousScrollOffsetRef.current + 63
        );
        previousScrollOffsetRef.current = null;
    }, [collectedMessages.length]);

    useEffect(() => {
        const isNearBottom = isUserNearBottom();
        if (isNearBottom) {
            scrollToBottomAndDisableNewMessageNotification();
            return;
        }
    }, [hasNewFreshMessage]);

    // ✨ Lovingly ripped this off of https://github.com/TanStack/virtual/issues/27#issuecomment-2353481103 ✨
    // Just typed it a bit
    const reverseScroll = (event: WheelEvent) => {
        event.preventDefault();
        (event.currentTarget as HTMLDivElement).scrollTop -= event.deltaY;
    };

    useEffect(() => {
        const scrollParent = scrollParentRef.current;
        scrollParent?.addEventListener('wheel', reverseScroll, { passive: false });
        const unsubscribeFromMessagelistener = messageService.listenForNewMessages(
            messageGroup.id,
            handleIncomingMessage
        );
        return () => {
            unsubscribeFromMessagelistener();
            scrollParent?.removeEventListener('wheel', reverseScroll);
        };
    }, []);

    return (
        <Wrapper>
            <ChatPageHeaderArea />
            {isFetchingNextPage && <LoadingSpinner />}
            <MessageArea
                reverse={true}
                ref={scrollParentRef}
                onHitBottom={() => {
                    setHasNewFreshMessage(false);
                }}
            >
                <VirtualizerParent
                    id="ugabuga-debug-scroll-height"
                    virtualizerHeight={virtualizer.getTotalSize()}
                >
                    {virtualizer.getVirtualItems().map((virtualItem) => {
                        const message = collectedMessages[virtualItem.index];
                        const oldestMessageReached =
                            message &&
                            (message as unknown as SystemMessage).type ===
                                SystemMessageType.OLDEST_MESSAGE_REACHED;
                        return (
                            <VirtualizerItem key={virtualItem.index} virtualItem={virtualItem}>
                                {oldestMessageReached ? (
                                    <OldestMessageReachedNotification>
                                        - start of conversation -
                                    </OldestMessageReachedNotification>
                                ) : (
                                    <Message
                                        ref={virtualizer.measureElement}
                                        key={(message as SavedMessage).id}
                                        text={(message as SavedMessage).text}
                                        isFromCurrentUser={
                                            (message as SavedMessage).senderDisplayName ===
                                            communicationMembers?.displayName
                                        }
                                        index={virtualItem.index}
                                        timestamp={new Date(
                                            (message as SavedMessage).createdAt.toDate()
                                        ).toLocaleTimeString()}
                                    />
                                )}
                            </VirtualizerItem>
                        );
                    })}
                </VirtualizerParent>
            </MessageArea>
            <form>
                <InputArea>
                    <MessageInput
                        onChange={(event) => {
                            event.preventDefault();
                            setMessageText(event.target.value);
                        }}
                        placeholder="Type a message..."
                        value={messageText}
                    />
                    <Button
                        variant="outline"
                        onClick={(e) => {
                            e.preventDefault();
                            const generatedWords = generate({ min: 5, max: 30 });
                            const phrase =
                                typeof generatedWords === 'string'
                                    ? generatedWords
                                    : generatedWords.join(' ');
                            setMessageText(phrase);
                        }}
                    >
                        <UpdateIcon />
                    </Button>
                    <Button
                        variant="solid"
                        onClick={(event) => {
                            event.preventDefault();
                            handleSendMessage(messageText);
                            setMessageText('');
                        }}
                        type="submit"
                    >
                        Send
                    </Button>
                </InputArea>
            </form>
            {hasNewFreshMessage && (
                <NewMessageAlert onClick={scrollToBottomAndDisableNewMessageNotification} />
            )}
        </Wrapper>
    );
};
