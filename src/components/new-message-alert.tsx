import styled from '@emotion/styled';
import { ChevronDownIcon } from '@radix-ui/react-icons';

const Wrapper = styled.div`
    position: fixed;
    bottom: 85px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
`;

const NotificationButton = styled.div`
    border-radius: 100px;
    border: 1px solid #ccc;
    padding: 4px 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    cursor: pointer;
    background-color: #fff;
    width: 160px;
`

interface NewMessageAlertProps {
    onClick?: () => void;
}

export function NewMessageAlert({ onClick }: NewMessageAlertProps) {
    return (
        <Wrapper>
            <NotificationButton onClick={onClick}>
                <ChevronDownIcon />
                    New message
                <ChevronDownIcon />
            </NotificationButton>
        </Wrapper>
    );
}
