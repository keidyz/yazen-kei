import { ChatPage, LoginPage } from './pages/index.js';
import { UserContext } from './contexts/index.js'
import { useContext } from 'react'

export function App() {
  const { user } = useContext(UserContext)
  return <ChatPage />
  // return user ? <ChatPage /> : <LoginPage />
}
