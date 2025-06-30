import { createContext, useState, ReactNode } from 'react';
import { messageService, SavedMessageGroup } from '../services/message-service.js';

interface CommunicationMembers {
    displayName: string;
    targetDisplayName: string;
}

type ChatGroupContextType = {
    messageGroup: SavedMessageGroup | null;
    communicationMembers: CommunicationMembers | null;
    setCommunicationMembers: (communicationMembers: CommunicationMembers | null) => void;
};

export const ChatGroupContext = createContext<ChatGroupContextType>({
    messageGroup: null,
    communicationMembers: null,
    setCommunicationMembers: () => {},
});

export const ChatGroupProvider = ({ children }: { children: ReactNode }) => {
    const [messageGroup, setMessageGroup] = useState<SavedMessageGroup | null>(null);
    const [communicationMembers, setCommunicationMembers] = useState<{
        displayName: string;
        targetDisplayName: string;
    } | null>(null);

    const handleSetCommunicationMembers = async (
        communicationMembers: CommunicationMembers | null
    ) => {
        setCommunicationMembers(communicationMembers);
        if (!communicationMembers) {
            setMessageGroup(null);
            return;
        }
        const { displayName, targetDisplayName } = communicationMembers;

        const messageGroup = await messageService.readMessageGroupByDisplayNames([
            displayName,
            targetDisplayName,
        ]);
        if (messageGroup) {
            setMessageGroup(messageGroup);
            return;
        }
        const createdMessageGroup = await messageService.addMessageGroup({
            displayNames: [displayName, targetDisplayName],
        });
        setMessageGroup(createdMessageGroup);
    };

    return (
        <ChatGroupContext.Provider
            value={{
                messageGroup,
                // @TODO: Not good for app expansion, prepare to implement a user context
                communicationMembers,
                setCommunicationMembers: handleSetCommunicationMembers,
            }}
        >
            {children}
        </ChatGroupContext.Provider>
    );
};
