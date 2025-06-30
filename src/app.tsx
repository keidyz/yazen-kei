import { ChatPage } from './pages/index.js';
import { ChatGroupContext } from './contexts/index.js';
import { useContext } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { InputInformationModal } from './components/input-information-modal.js';

export function App() {
    const queryClient = new QueryClient();
    const chatGroupContext = useContext(ChatGroupContext);

    return chatGroupContext.messageGroup ? (
        <QueryClientProvider client={queryClient}>
            <ChatPage />
        </QueryClientProvider>
    ) : (
        <InputInformationModal
            onSubmit={({ displayName, targetDisplayName }) => {
                chatGroupContext.setCommunicationMembers({
                    displayName,
                    targetDisplayName,
                });
            }}
        />
    );
}
