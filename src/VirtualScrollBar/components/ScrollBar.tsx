import React, { useState, forwardRef, useCallback, useEffect, useRef, useImperativeHandle } from "react"
import raf from "../raf"
import clsx from "clsx"
import type { ScrollState } from "../types"
import { getPageXY } from "../utils"

export interface ScrollBarProps {
	/** 当前滚动状态 */
	scrollState: ScrollState
	/** 当前可视区容器大小 */
	containerSize: number
	/** 内容最大高度 */
	scrollRange: number
	/** 滚动回调 */
	onScroll?: (offset: number) => void
	/** 开始滚动的回调 */
	onStartMove?: () => void
	/** 停止滚动的回调 */
	onStopMove?: () => void
	/** 样式前缀 */
	prefixCls?: string
	/** 滚动条粗细 */
	thumbSize: {
		/** 宽度 */
		width: number
		/** 高度 */
		height: number
	}
	/** 滚动条是否隐藏 */
	hidden?: boolean
	/** 滚动条隐藏延时 */
	autoHideTimeout?: number
}

export interface ScrollBarRef {
	/** 延时隐藏滚动条 */
	delayHiddenScrollBar: () => void
}

const ScrollBar = forwardRef<ScrollBarRef, ScrollBarProps>((props, ref) => {
	const {
		scrollState,
		containerSize,
		scrollRange,
		onScroll,
		onStartMove,
		onStopMove,
		prefixCls,
		thumbSize,
		hidden,
		autoHideTimeout,
	} = props
	
	// 拖拽状态
	const [dragging, setDragging] = useState<boolean>(false)
	
	// 当前点击滚动thumb的位置
	const [pageXY, setPageXY] = useState<number>(0)
	
	// 记录拖拽前的top位置
	const [startTop, setStartTop] = useState<number>(0)
	
	// ========================= Refs =========================
	const trackRef = useRef<HTMLDivElement>({} as HTMLDivElement)
	const thumbRef = useRef<HTMLDivElement>({} as HTMLDivElement)
	
	// ======================= Visible ========================
	const [visible, setVisible] = useState(false)
	const visibleTimeoutRef = useRef<ReturnType<typeof setTimeout>>()
	
	const delayHiddenScrollBar = useCallback(() => {
		clearTimeout(visibleTimeoutRef.current)
		setVisible(true)
		
		visibleTimeoutRef.current = setTimeout(() => {
			setVisible(false)
		}, autoHideTimeout)
	}, [])
	
	useEffect(() => {
		delayHiddenScrollBar()
	}, [scrollState.y])
	
	// ====================== Container =======================
	const onContainerMouseDown: React.MouseEventHandler = useCallback((event) => {
		event.stopPropagation()
		event.preventDefault()
	}, [])
	
	// ======================== Range =========================
	// 容器实际滚动高度 = 内容最大高度 - 内容可见高度
	const enableScrollRange = scrollRange - containerSize || 0
	// 可以滚动的高度 = 滚动的容器高度 - 滚动条高度
	const enableOffsetRange = containerSize - thumbSize.height || 0
	
	// `scrollWidth` < `clientWidth` means no need to show scrollbar
	const canScroll = enableScrollRange > 0
	
	// ========================= Top ==========================
	const top = React.useMemo(() => {
		if (scrollState.y === 0 || enableScrollRange === 0) {
			return 0
		}
		const ptg = scrollState.y / enableScrollRange
		return ptg * enableOffsetRange
	}, [scrollState.y, enableScrollRange, enableOffsetRange])
	
	// ======================== Thumb =========================
	const stateRef = useRef({top, dragging, pageY: pageXY, startTop})
	stateRef.current = {top, dragging, pageY: pageXY, startTop}
	
	const onThumbMouseDown = useCallback((event: React.MouseEvent | React.TouchEvent | TouchEvent) => {
		setDragging(true)
		setPageXY(getPageXY(event))
		setStartTop(stateRef.current.top)
		
		onStartMove?.()
		event.stopPropagation()
		event.preventDefault()
	}, [])
	
	const onScrollbarTouchStart = useCallback((event: TouchEvent) => {
		event.preventDefault()
	}, [])
	
	useEffect(() => {
		const scrollbarEle = trackRef.current
		const thumbEle = thumbRef.current
		scrollbarEle.addEventListener("touchstart", onScrollbarTouchStart)
		thumbEle.addEventListener("touchstart", onThumbMouseDown)
		
		return () => {
			scrollbarEle.removeEventListener("touchstart", onScrollbarTouchStart)
			thumbEle.removeEventListener("touchstart", onThumbMouseDown)
		}
	}, [])
	
	// Pass to effect
	const enableScrollRangeRef = React.useRef<number>(0)
	enableScrollRangeRef.current = enableScrollRange
	const enableOffsetRangeRef = React.useRef<number>(0)
	enableOffsetRangeRef.current = enableOffsetRange
	
	useEffect(() => {
		if (dragging) {
			let moveRafId: number
			
			const onMouseMove = (event: MouseEvent | TouchEvent) => {
				const {
					dragging: stateDragging,
					pageY: statePageY,
					startTop: stateStartTop,
				} = stateRef.current
				raf.cancel(moveRafId)
				
				if (stateDragging) {
					const offset = getPageXY(event) - statePageY
					let newTop = stateStartTop
					
					newTop += offset
					
					const tmpEnableScrollRange = enableScrollRangeRef.current
					const tmpEnableOffsetRange = enableOffsetRangeRef.current
					
					const ptg: number = tmpEnableOffsetRange ? newTop / tmpEnableOffsetRange : 0
					
					let newScrollTop = Math.ceil(ptg * tmpEnableScrollRange)
					newScrollTop = Math.max(newScrollTop, 0)
					newScrollTop = Math.min(newScrollTop, tmpEnableScrollRange)
					
					moveRafId = raf(() => {
						onScroll?.(newScrollTop)
					})
				}
				
			}
			
			const onMouseUp = () => {
				setDragging(false)
				onStopMove?.()
			}
			
			window.addEventListener("mousemove", onMouseMove)
			window.addEventListener("touchmove", onMouseMove)
			window.addEventListener("mouseup", onMouseUp)
			window.addEventListener("touchend", onMouseUp)
			
			return () => {
				window.removeEventListener("mousemove", onMouseMove)
				window.removeEventListener("touchmove", onMouseMove)
				window.removeEventListener("mouseup", onMouseUp)
				window.removeEventListener("touchend", onMouseUp)
				raf.cancel(moveRafId)
			}
		}
	}, [dragging])
	
	// ====================== Imperative ======================
	useImperativeHandle(ref, () => ({
		delayHiddenScrollBar,
	}))
	
	const trackStyles: React.CSSProperties = {
		visibility: !hidden && visible && canScroll ? undefined : "hidden",
		width: thumbSize.width
	}
	
	const thumbStyles: React.CSSProperties = {
		transform: `translateY(${ top }px)`,
		height: thumbSize.height,
	}
	
	return (
		<div
			ref={ trackRef }
			style={ trackStyles }
			className={ clsx(`${ prefixCls }-vertical-track`) }
			onMouseDown={ onContainerMouseDown }
			onMouseMove={ delayHiddenScrollBar }
		>
			<div
				ref={ thumbRef }
				style={ thumbStyles }
				className={ clsx(`${ prefixCls }-vertical-thumb`) }
				onMouseDown={ onThumbMouseDown }
			/>
		</div>
	)
})

export default ScrollBar
