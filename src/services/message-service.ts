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
} from "firebase/firestore";
import { firestoreDataBase } from "./firestore-service.js";
// import Date from firestore
import { Timestamp } from "firebase/firestore";

interface BaseExtraFields {
  createdAt: Timestamp;
  updatedAt: Timestamp;
  id: string;
}

interface Message {
  senderEmail: string;
  text: string;
}

export type SavedMessage = Message & BaseExtraFields;

interface MessageGroup {
  // @TODO ugabuga have some dignity and change this to memberIds
  // concatenate emails for now for a quick search
  memberEmails: string;
}

type SavedMessageGroup = MessageGroup & BaseExtraFields;

interface AddMessageGroup extends Omit<MessageGroup, "memberEmails"> {
  memberEmails: string[];
}

class MessageService {
  private firestoreDatabase: Firestore;
  private messageGroupCollectionName = "messageGroup";
  private messageCollectionName = "message";

  constructor(firestoreDatabase: Firestore) {
    this.firestoreDatabase = firestoreDatabase;
  }

  // supported features right now are only one-to-one message groups
  // but prepare message group for multiple participants
  // and prepare to have multiple message groups

  // @TODO: readMessageGroupById instead
  async readMessageGroupByMemberEmails(
    memberEmails: string[]
  ): Promise<SavedMessageGroup | null> {
    const messageGroupsReference = collection(
      this.firestoreDatabase,
      this.messageGroupCollectionName
    );

    // NOTE this will break when message groups have more than 2 members
    // @TODO grab message group by id, the app will most likely have a sidebar
    // with all the message groups anyway

    const sortedMemberEmailsString = memberEmails.sort().join(",");
    // @TOO verify how expensive this could be
    const queryByMemberIds = query(
      messageGroupsReference,
      where("memberEmails", "==", sortedMemberEmailsString),
      limit(1) // Limit to one message group
    );
    const messageGroupsDocuments = await getDocs(queryByMemberIds);
    if (messageGroupsDocuments.empty) {
      return null; // No message group found
    }
    return {
      ...messageGroupsDocuments.docs[0].data(),
      id: messageGroupsDocuments.docs[0].id,
    } as SavedMessageGroup;
  }

  async addMessageGroup(messageGroup: AddMessageGroup): Promise<null> {
    const messageGroupsReference = collection(
      this.firestoreDatabase,
      this.messageGroupCollectionName
    );
    await addDoc(messageGroupsReference, {
      ...messageGroup,
      memberEmails: messageGroup.memberEmails.sort().join(","),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    // would be nice to return the created doc cheaply tbh
    return null;
  }

  async addMessageToGroup(
    messageGroupId: string,
    message: Message
  ): Promise<void> {
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
      orderBy("createdAt", "desc"),
      ...(previousCursorData ? [startAfter(previousCursorData.createdAt)] : []),
      limit(amount),
    ];
    const queryByMessageGroupId = query(
      messageGroupsReference,
      ...queryParameters
    );
    const messagesDocuments = await getDocs(queryByMessageGroupId);
    if (messagesDocuments.empty) {
      return []; // No messages found
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
      where("createdAt", ">=", new Date()),
    )

    return onSnapshot(queryForNewMessages, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type !== "added") {
          return;
        }
        handleNewMessage(change.doc.data() as SavedMessage);
      });
    });
  }
}

// jusr export a singleton for now
export const messageService = new MessageService(firestoreDataBase);
