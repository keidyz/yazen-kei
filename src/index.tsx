import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app.jsx'
import { UserProvider } from './contexts/user-context.js'
import { ThemeProvider, Global } from '@emotion/react'

export const theme = {
    colors: {
        bubbleIncomingBg: '#e5e5ea',
        bubbleIncomingText: '#000',
        bubbleOutgoingBg: '#007aff',
        bubbleOutgoingText: '#fff',
        primary: '#007aff',
        secondary: '#5856d6',
    },
    fonts: {
        body: '"Funnel Sans", sans-serif',
        heading: '"Funnel Display", sans-serif',
    },
}

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <ThemeProvider theme={theme}>
            <Global
                styles={{
                    body: {
                        fontFamily: theme.fonts.body,
                    },
                }}
            />
            <UserProvider>
                <App />
            </UserProvider>
        </ThemeProvider>
    </StrictMode>
)
