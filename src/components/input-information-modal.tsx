// last minute rush of importing radix-ui
import { Dialog, Button, TextField } from '@radix-ui/themes';
import styled from '@emotion/styled';

const InputWrapper = styled.div`
    display: flex;
    flex-direction: column;
    margin: 8px 0;
`;
const ButtonWrapper = styled.div`
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
`;

interface InputInformationModalProps {
    onSubmit?: ({
        displayName,
        targetDisplayName,
    }: {
        displayName: string;
        targetDisplayName: string;
    }) => void;
}

// @TODO move away from this to a proper page after proper login implementation
// if we still want this as a modal, disable defaultOpen and use standard
// modal props like open, onOpenChange, etc.
export const InputInformationModal = ({ onSubmit }: InputInformationModalProps) => {
    return (
        <Dialog.Root defaultOpen={true}>
            <Dialog.Content
                onInteractOutside={(e) => {
                    e.preventDefault();
                }}
            >
                <Dialog.Title>Chat App 👓</Dialog.Title>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        const { currentUser, targetUser } = e.target as HTMLFormElement;
                        const displayName = currentUser.value;
                        const targetDisplayName = targetUser.value;
                        onSubmit({ displayName, targetDisplayName });
                    }}
                >
                    <InputWrapper>
                        <label htmlFor="currentUser">Display Name:</label>
                        <TextField.Root id="currentUser" name="currentUser" required />
                    </InputWrapper>
                    <InputWrapper>
                        <label htmlFor="targetUser">Target User Display Name:</label>
                        <TextField.Root id="targetUser" name="targetUser" required />
                    </InputWrapper>
                    <ButtonWrapper>
                        <Button variant="classic" type="submit">
                            Start Chatting
                        </Button>
                    </ButtonWrapper>
                </form>
            </Dialog.Content>
        </Dialog.Root>
    );
};
