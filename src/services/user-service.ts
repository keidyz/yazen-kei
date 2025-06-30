import { getDoc, collection, Firestore, getDocs, query, where, addDoc, doc, orderBy, setDoc } from "firebase/firestore";
import { firestoreDataBase } from "./firestore-service.js";

export interface User {
    id: string;
    displayName: string | null;
    email: string | null;
}

export interface SavedUser extends User {
    createdAt: string;
    updatedAt: string;
}

class UserService {
    private firestoreDatabase: Firestore;

    constructor(firestoreDatabase: Firestore) {
        this.firestoreDatabase = firestoreDataBase;
    }

    async addUserIfNotExists(user: User): Promise<void> {
        const docSnapshot = await getDoc(doc(this.firestoreDatabase, 'users', user.id))
        if(docSnapshot.exists()) {
            // update user? return user?
            return;
        }
        await setDoc(doc(this.firestoreDatabase, 'users', user.id), {
            ...user,
            createdAt: new Date(),
            updatedAt: new Date()
        })
    }

    async getUserById(id: string): Promise<SavedUser> {
        const docSnapshot = await getDoc(doc(this.firestoreDatabase, 'users', id))
        return docSnapshot.data as unknown as SavedUser;
    }
}

export const userService = new UserService(firestoreDataBase);
