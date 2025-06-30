import { createContext, useState, ReactNode } from 'react'
import { userService, User } from '../services/user-service.js'
import { getAuth, signOut } from 'firebase/auth'

type UserContextType = {
    user: User | null
    setUser: (user: User | null) => Promise<void>
    logout: () => Promise<void>
}

export const UserContext = createContext<UserContextType>({
    user: null,
    setUser: (() => {}) as unknown as (user: User | null) => Promise<void>,
    logout: (() => {}) as unknown as () => Promise<void>
})

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User>(null)

    const setUserAndUpdateDatabase = async (user: User) => {
        await userService.addUserIfNotExists(user)
        setUser(user)
    }

    const handleLogout = async () => {
        const auth = getAuth()
        await signOut(auth)
        setUser(null)
    }

    return (
        <UserContext.Provider
            value={{ user, setUser: setUserAndUpdateDatabase, logout: handleLogout }}
        >
            {children}
        </UserContext.Provider>
    )
}
