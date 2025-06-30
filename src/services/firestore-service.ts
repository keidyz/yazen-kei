import { getFirestore } from 'firebase/firestore';
import { firebaseApp } from './firebase-service.js';

export const firestoreDataBase = getFirestore(firebaseApp);
