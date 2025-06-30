import { theme } from './index.js';

type TypedTheme = typeof theme;

declare module '@emotion/react' {
    export interface Theme extends TypedTheme {}
}
