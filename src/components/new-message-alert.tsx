import styled from '@emotion/styled'
import { ChevronDownIcon } from '@radix-ui/react-icons';

const Wrapper = styled.div`
    border-radius: 100px;
    border: 1px solid #ccc;
    position: fixed;
    top: 93%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 4px 8px;
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
`

interface NewMessageAlertProps {
  onClick?: () => void;
}

export function NewMessageAlert({ onClick }: NewMessageAlertProps) {
  return (
    <Wrapper onClick={onClick}>
      <ChevronDownIcon />
      New message
    </Wrapper>
  );
}