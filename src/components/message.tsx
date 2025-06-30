import styled from '@emotion/styled';

interface MessageProps {
    text: string;
    isFromCurrentUser: boolean;
    timestamp: string;
    ref: any;
    index: number;
}

const MessageWrapper = styled('div')<{ isFromCurrentUser: boolean }>(
    ({ isFromCurrentUser, theme: { colors, fonts } }) => `
    display: flex;
    flex-direction: column;
    padding: 10px 0;

    .message-timsestamp {
        text-align: ${isFromCurrentUser ? 'right' : 'left'};
        font-size: 0.8em;
        color: #888;
        margin-bottom: 5px;
    }

    .message-text {
        padding: 10px;
        border-radius: 20px;
        background-color: ${isFromCurrentUser ? colors.bubbleOutgoingBg : colors.bubbleIncomingBg};
        color: ${isFromCurrentUser ? colors.bubbleOutgoingText : colors.bubbleIncomingText};
        max-width: 70%;
        word-break: break-word;
        margin-left: ${isFromCurrentUser ? 'auto' : 'inherit'};
        margin-right: ${isFromCurrentUser ? 'inherit' : 'auto'};
    }
`
);

export function Message({ text, isFromCurrentUser, timestamp, ref, index }: MessageProps) {
    return (
        <MessageWrapper isFromCurrentUser={isFromCurrentUser} ref={ref} data-index={index}>
            <div className="message-timsestamp">{timestamp}</div>
            <div className="message-text">{text}</div>
        </MessageWrapper>
    );
}
