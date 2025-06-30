import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app.jsx';
import { ChatGroupProvider } from './contexts/chat-group-context.js';
import { ThemeProvider, Global } from '@emotion/react';
import '@radix-ui/themes/styles.css';
import { Theme as RadixUiTheme } from '@radix-ui/themes';

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
};

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <ThemeProvider theme={theme}>
            {/* Last minute pulling radix-ui */}
            <RadixUiTheme>
                <Global
                    styles={{
                        body: {
                            fontFamily: theme.fonts.body,
                            overflowY: 'hidden',
                        },
                        '.radix-themes': {
                            '--default-font-family': theme.fonts.body,
                        },
                    }}
                />
                <ChatGroupProvider>
                    <App />
                </ChatGroupProvider>
            </RadixUiTheme>
        </ThemeProvider>
    </StrictMode>
);
