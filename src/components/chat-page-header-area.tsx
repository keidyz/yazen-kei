import styled from '@emotion/styled';
import { PersonIcon } from '@radix-ui/react-icons';
import { useContext } from 'react';
import { ChatGroupContext } from '../contexts/chat-group-context.js';
import { Button, Heading } from '@radix-ui/themes';

const Wrapper = styled('div')(({ theme: { fonts } }) => `
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
    justify-content: center;
    gap: 10px;

    svg {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 1px solid black;
    }
`);

const NewChatButton = styled(Button)`
    margin-left: auto;
    position: absolute;
    right: 10px;
`;

export const ChatPageHeaderArea = () => {
    const { communicationMembers, setCommunicationMembers } = useContext(ChatGroupContext);

    return (
        <Wrapper>
            {/* @TODO Prepare to replace with a real photo */}
            <PersonIcon />
            <Heading>{communicationMembers.targetDisplayName}</Heading>

            <NewChatButton
                variant="solid"
                onClick={() => {
                    setCommunicationMembers(null);
                }}
            >
                New Chat
            </NewChatButton>
        </Wrapper>
    );
};
