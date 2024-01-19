import React, { forwardRef, useEffect, useRef } from "react"
import type { CSSProperties, PropsWithChildren } from "react"
import raf from "./raf"

export interface Size {
	width: number
	height: number
}

export interface ResponsiveProps {
	onResize?: (size: Size) => void
	onMouseEnter?: () => void
}

const Responsive = forwardRef<HTMLDivElement, PropsWithChildren<ResponsiveProps>>(({onResize, children}) => {
	
	const resizeObserverRef = useRef<HTMLDivElement>({} as HTMLDivElement)
	
	const collectRafRef = useRef<number>(-1)
	
	useEffect(() => {
		const target = resizeObserverRef.current
		const observer = new ResizeObserver(() => {
			const {width = 0, height = 0} = target?.getBoundingClientRect?.() || {}
			collectRafRef.current = raf(() => {
				onResize?.({width, height})
			})
		})
		observer.observe(target)
		return () => {
			observer.disconnect()
		}
	}, [])
	
	return (
		<div ref={ resizeObserverRef } style={ styles }>
			{ children }
		</div>
	)
})

export default Responsive
