import styled from '@emotion/styled';
import { useRef, forwardRef } from 'react';

const TransformedWrapper = styled.div<{ flipY?: boolean }>(
    ({ flipY }) => `
    transform: ${flipY ? 'scaleY(-1)' : 'none'};
`
);

interface ScrollableContainerProps {
    children?: React.ReactNode;
    className?: string;
    onHitTop?: () => void;
    onHitBottom?: () => void;
    reverse?: boolean;
}

// forward ref may be deprecated in react 19 https://react.dev/blog/2024/12/05/react-19#ref-as-a-prop
// but I don't think emotion's styled components support the new way yet since I was having
// issues with the ref not being passed down correctly
export const ScrollableContainer = forwardRef<HTMLDivElement, ScrollableContainerProps>(
    ({ children, className, onHitTop, onHitBottom, reverse }, ref) => {
        const containerRef = ref || useRef(null);

        return (
            <TransformedWrapper
                ref={containerRef}
                className={className}
                flipY={reverse}
                onScroll={async (event: any) => {
                    const { scrollTop, scrollHeight, clientHeight } = event.target;
                    const position = Math.ceil((scrollTop / (scrollHeight - clientHeight)) * 100);
                    if (position > 95) {
                        reverse ? onHitTop?.() : onHitBottom?.();
                        return;
                    }
                    if (position === 0) {
                        reverse ? onHitBottom?.() : onHitTop?.();
                        return;
                    }
                }}
            >
                {children}
            </TransformedWrapper>
        );
    }
);
