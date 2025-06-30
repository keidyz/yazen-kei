import {
    getDoc,
    collection,
    Firestore,
    getDocs,
    query,
    where,
    addDoc,
    doc,
    orderBy,
    limit,
    startAfter,
    onSnapshot,
} from 'firebase/firestore';
import { firestoreDataBase } from './firestore-service.js';
import { Timestamp } from 'firebase/firestore';

interface BaseExtraFields {
    createdAt: Timestamp;
    updatedAt: Timestamp;
    id: string;
}

interface Message {
    senderDisplayName: string;
    text: string;
}

export type SavedMessage = Message & BaseExtraFields;

interface MessageGroup {
    // @TODO have some dignity and change this to memberIds
    // concatenate displayNames for now for a quick search
    displayNames: string;
}

export type SavedMessageGroup = MessageGroup & BaseExtraFields;

interface AddMessageGroup extends Omit<MessageGroup, 'displayNames'> {
    displayNames: string[];
}

class MessageService {
    private firestoreDatabase: Firestore;
    private messageGroupCollectionName = 'yazenKeiMessageGroups';
    private messageCollectionName = 'messages';

    constructor(firestoreDatabase: Firestore) {
        this.firestoreDatabase = firestoreDatabase;
    }

    // @TODO for expansion, use memberids instead of displayNames
    // Message Group shape is at least prepared for multiple participants
    // There has to be a better way to keep track of shapes
    ////////////////////////////////
    //  ---- MESSAGE GROUP ----   //
    // - displayNames: string[]   //
    // - createdAt: Date          //
    // - updatedAt: Date          //
    // - message: Message[]       //
    ////////////////////////////////
    //     ---- Message ----       //
    // - senderDisplayName: string //
    // - text: string              //
    // - createdAt: Date           //
    // - updatedAt: Date           //
    /////////////////////////////////

    // @TODO: readMessageGroupByMemberIds instead
    async readMessageGroupByDisplayNames(
        displayNames: string[]
    ): Promise<SavedMessageGroup | null> {
        const messageGroupsReference = collection(
            this.firestoreDatabase,
            this.messageGroupCollectionName
        );

        // NOTE this will break when message groups have more than 2 members
        const sortedDisplayNamesString = displayNames.sort().join(',');
        // @TOO verify how expensive this could be
        const queryByMemberIds = query(
            messageGroupsReference,
            where('displayNames', '==', sortedDisplayNamesString),
            limit(1) // Limit to one message group for now
        );
        const messageGroupsDocuments = await getDocs(queryByMemberIds);
        if (messageGroupsDocuments.empty) {
            return null;
        }
        return {
            ...messageGroupsDocuments.docs[0].data(),
            id: messageGroupsDocuments.docs[0].id,
        } as SavedMessageGroup;
    }

    async addMessageGroup(messageGroup: AddMessageGroup): Promise<SavedMessageGroup> {
        const messageGroupsReference = collection(
            this.firestoreDatabase,
            this.messageGroupCollectionName
        );

        await addDoc(messageGroupsReference, {
            ...messageGroup,
            displayNames: messageGroup.displayNames.sort().join(','),
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        // @TODO check if there's a cheaper way to do this in firestore
        return this.readMessageGroupByDisplayNames(messageGroup.displayNames);
    }

    async addMessageToGroup(messageGroupId: string, message: Message): Promise<void> {
        const messageGroupReference = collection(
            this.firestoreDatabase,
            this.messageGroupCollectionName,
            messageGroupId,
            this.messageCollectionName
        );
        await addDoc(messageGroupReference, {
            ...message,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    async browseMessagesByGroupId(
        messageGroupId: string,
        amount: number,
        previousMessageId: string | null = null
    ): Promise<SavedMessage[]> {
        const messageGroupsReference = collection(
            this.firestoreDatabase,
            this.messageGroupCollectionName,
            messageGroupId,
            this.messageCollectionName
        );

        const messageGroupDoc = await getDocs(messageGroupsReference);

        if (messageGroupDoc.empty) {
            return [];
        }
        const previousCursorData = previousMessageId
            ? (await getDoc(doc(messageGroupsReference, previousMessageId))).data()
            : null;

        const queryParameters = [
            orderBy('createdAt', 'desc'),
            ...(previousCursorData ? [startAfter(previousCursorData.createdAt)] : []),
            limit(amount),
        ];
        const queryByMessageGroupId = query(messageGroupsReference, ...queryParameters);
        const messagesDocuments = await getDocs(queryByMessageGroupId);
        if (messagesDocuments.empty) {
            return [];
        }
        return messagesDocuments.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
        })) as SavedMessage[];
    }

    listenForNewMessages(
        messageGroupId: string,
        handleNewMessage: (message: SavedMessage) => void
    ) {
        const messageGroupsReference = collection(
            this.firestoreDatabase,
            this.messageGroupCollectionName,
            messageGroupId,
            this.messageCollectionName
        );

        const queryForNewMessages = query(
            messageGroupsReference,
            where('createdAt', '>=', new Date())
        );

        return onSnapshot(queryForNewMessages, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type !== 'added') {
                    return;
                }
                handleNewMessage(change.doc.data() as SavedMessage);
            });
        });
    }
}

// jusr export a singleton for now
export const messageService = new MessageService(firestoreDataBase);
