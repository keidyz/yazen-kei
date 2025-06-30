import { useContext } from 'react'
import { firebaseAuth } from '../services/index.js'
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { UserContext } from '../contexts/index.js'


const provider = new GoogleAuthProvider()

export function LoginPage() {
    const userContext = useContext(UserContext)
    const handleLogin = async () => {
        const signInResult = await signInWithPopup(firebaseAuth, provider)
        const user = signInResult.user
        await userContext.setUser({
            id: user.uid,
            displayName: user.displayName,
            email: user.email
        })
        // @TODO OMG HANDLE ERRORS OI
    }
    return (
        <div className="login-page">
            <h1>Welcome to the Chat App</h1>
            <p>Please log in to continue.</p>
            <button
                onClick={() =>
                    handleLogin()
                }
            >
                Log In
            </button>
        </div>
    )
}
