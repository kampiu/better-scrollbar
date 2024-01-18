import React, { forwardRef, useCallback, useRef } from "react"
import styles from "./VerticalScrollBar.module.less"
import { IScrollerStore } from "./context/Scroller"
import css from "dom-css"
import { disableSelectStyle } from "../../../src/Scrollbar/styles"
import returnFalse from "../../../src/utils/returnFalse"

export interface VerticalScrollBarProps {
	scrollState: IScrollerStore
}

const VerticalScrollBar = forwardRef<HTMLDivElement, VerticalScrollBarProps>(
	({scrollState}, ref) => {
		
		const prevPageX = useRef<number | null>(null)
		const prevPageY = useRef<number | null>(null)
		const dragging = useRef<boolean>(false)
		
		const handleDrag = useCallback((event: MouseEvent) => {
			if (prevPageX.current) {
				const {clientX} = event
				const {left: trackLeft} = (this.trackHorizontal as HTMLElement).getBoundingClientRect()
				const thumbWidth = this.getThumbHorizontalWidth()
				const clickPosition = thumbWidth - this.prevPageX
				const offset = -trackLeft + clientX - clickPosition
				// ;(this.view as HTMLElement).scrollLeft = this.getScrollLeftForOffset(offset)
			}
			if (prevPageY.current) {
				const {clientY} = event
				const {top: trackTop} = (this.trackVertical as HTMLElement).getBoundingClientRect()
				const thumbHeight = this.getThumbVerticalHeight()
				const clickPosition = thumbHeight - prevPageY.current
				const offset = -trackTop + clientY - clickPosition
				// ;(this.view as HTMLElement).scrollTop = this.getScrollTopForOffset(offset)
			}
			return false
		}, [])
		
		const setupDragging = useCallback(() => {
			css(document.body, disableSelectStyle as { [P in keyof CSSStyleDeclaration]?: string | number })
			document.addEventListener("mousemove", handleDrag)
			document.addEventListener("mouseup", this.handleDragEnd)
			document.onselectstart = returnFalse
		}, [])
		
		const onDragStart = useCallback((event: MouseEvent) => {
			dragging.current = true
			event.stopImmediatePropagation()
			setupDragging()
		}, [])
		
		const onMouseDown = useCallback((event: MouseEvent) => {
			event.preventDefault()
			onDragStart(event)
			const {target, clientY} = event
			const {offsetHeight} = (target as HTMLDivElement)
			const {top} = (target as HTMLDivElement).getBoundingClientRect()
			this.prevPageY = offsetHeight - (clientY - top)
			
		}, [])
		
		const onMouseDown = useCallback(() => {
		
		}, [])
		
		const onMouseDown = useCallback(() => {
		
		}, [])
		
		const onMouseDown = useCallback(() => {
		
		}, [])
		
		return (
			<div
				className={ styles.scrollContainer }
			>
				<div
					className={ styles.scrollBar }
					ref={ ref }
					style={ {
						transform: `translateY(${ -scrollState.y / 20000 * 100 }px)`
					} }
				/>
			</div>
		)
	},
)

export default VerticalScrollBar
