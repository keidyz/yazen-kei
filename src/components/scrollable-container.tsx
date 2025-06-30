import styled from '@emotion/styled'
import { useEffect, useRef, useState } from 'react'
import { Virtualizer } from '@tanstack/react-virtual'
import { SavedMessage } from '../services/message-service.js'
import { Message, NewMessageAlert } from '../components/index.js'

export function ScrollableContainer({
    children,
    className,
    ref,
    onHitTop,
    onHitBottom
}: {
    children?: React.ReactNode
    className?: string
    ref?: React.RefObject<HTMLDivElement>
    onHitTop?: () => void
    onHitBottom?: () => void
}) {
    const containerRef = ref || useRef(null)

    return (
        <div
            ref={containerRef}
            className={className}
            onScroll={async (event: any) => {
                // console.log('scrolling', event.target.scrollTop)
                const { scrollTop, scrollHeight, clientHeight } = event.target
                const position = Math.ceil(
                    (scrollTop / (scrollHeight - clientHeight)) * 100
                )
                if(position > 95) {
                    onHitBottom?.()
                    return
                }
                if (position === 0) {
                    onHitTop?.()
                    return
                }
            }}
        >
            {children}
        </div>
    )
}
