import { getAuth } from "firebase/auth";
import { firebaseApp } from "./firebase-service.js";

export const firebaseAuth = getAuth(firebaseApp);