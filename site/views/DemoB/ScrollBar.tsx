import React, { useCallback, useEffect, useRef } from "react"
import styles from "./ScrollBar.module.less"

function getPageXY(
	e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent,
	horizontal: boolean,
) {
	const obj = 'touches' in e ? e.touches[0] : e;
	return obj[horizontal ? 'pageX' : 'pageY'];
}

function ScrollBar(props) {
	
	const [dragging, setDragging] = React.useState(false)
	const [pageXY, setPageXY] = React.useState<number | null>(null)
	const [startTop, setStartTop] = React.useState<number | null>(null)
	
	// ========================= Refs =========================
	const scrollbarRef = React.useRef<HTMLDivElement>({} as HTMLDivElement)
	const thumbRef = React.useRef<HTMLDivElement>({} as HTMLDivElement)
	
	// ======================= Visible ========================
	const [visible, setVisible] = React.useState(false)
	const visibleTimeoutRef = React.useRef<ReturnType<typeof setTimeout>>()
	
	const delayHidden = () => {
		clearTimeout(visibleTimeoutRef.current)
		setVisible(true)
		
		visibleTimeoutRef.current = setTimeout(() => {
			setVisible(false)
		}, 3000)
	}
	
	// ====================== Container =======================
	const onContainerMouseDown: React.MouseEventHandler = (event) => {
		event.stopPropagation()
		event.preventDefault()
	}
	
	// ======================== Thumb =========================
	const stateRef = React.useRef({top, dragging, pageY: pageXY, startTop})
	stateRef.current = {top, dragging, pageY: pageXY, startTop}
	
	const onThumbMouseDown = useCallback((event: React.MouseEvent | React.TouchEvent | TouchEvent) => {
		setDragging(true)
		
		event.stopPropagation()
		event.preventDefault()
	}, [])
	
	const onScrollbarTouchStart = useCallback((event: TouchEvent) => {
		event.preventDefault()
	}, [])
	
	useEffect(() => {
		const scrollbarEle = scrollbarRef.current
		const thumbEle = thumbRef.current
		scrollbarEle.addEventListener("touchstart", onScrollbarTouchStart)
		thumbEle.addEventListener("touchstart", onThumbMouseDown)
		
		return () => {
			scrollbarEle.removeEventListener("touchstart", onScrollbarTouchStart)
			thumbEle.removeEventListener("touchstart", onThumbMouseDown)
		}
	}, [])
	const wheelingRef = useRef<number | null>(null)
	
	// ======================== Range =========================
	const enableScrollRange = props?.scrollRange - props?.containerSize || 0;
	const enableOffsetRange = props?.containerSize - props?.spinSize || 0;
	
	// Pass to effect
	const enableScrollRangeRef = React.useRef<number>();
	enableScrollRangeRef.current = enableScrollRange;
	const enableOffsetRangeRef = React.useRef<number>();
	enableOffsetRangeRef.current = enableOffsetRange;
	
	useEffect(() => {
		console.log("->->", dragging)
		if (dragging) {
			let moveRafId: number
			
			const onMouseMove = (event: MouseEvent | TouchEvent) => {
				const {
					dragging: stateDragging,
					pageY: statePageY,
					startTop: stateStartTop,
				} = stateRef.current
				const containerOffset = scrollbarRef.current?.getBoundingClientRect()
				
				wheelingRef.current = window.requestAnimationFrame(() => {
					if (wheelingRef.current) {
						window.cancelAnimationFrame(wheelingRef.current)
					}
					wheelingRef.current = null
					
					if (stateDragging) {
						const offset = getPageXY(event) - statePageY - containerOffset?.top
						let newTop = stateStartTop

						newTop += offset

						const tmpEnableScrollRange = enableScrollRangeRef.current
						const tmpEnableOffsetRange = enableOffsetRangeRef.current

						const ptg: number = tmpEnableOffsetRange ? newTop / tmpEnableOffsetRange : 0

						let newScrollTop = Math.ceil(ptg * tmpEnableScrollRange)
						newScrollTop = Math.max(newScrollTop, 0)
						newScrollTop = Math.min(newScrollTop, tmpEnableScrollRange)

						props?.onScroll?.(newScrollTop)
					}
				})
				
			}
			
			const onMouseUp = () => {
				setDragging(false)
				props?.onStopMove?.()
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
			}
		}
	}, [dragging])
	
	// ========================= Top ==========================
	const offsetTop = React.useMemo(() => {
		if (props?.scrollOffset === 0 || enableScrollRange === 0) {
			return 0;
		}
		const ptg = props?.scrollOffset / enableScrollRange;
		return ptg * enableOffsetRange;
	}, [props?.scrollOffset, enableScrollRange, enableOffsetRange]);
	
	console.log("--setPageXY--", offsetTop, enableOffsetRange, props?.scrollOffset, enableScrollRange, props?.containerSize, props?.spinSize)
	return (
		<div ref={ scrollbarRef } className={ styles.scrollWrapper }>
			<div
				ref={ thumbRef }
				className={ styles.scrollBar }
				style={ {transform: `translateY(${ offsetTop }px)`, height: props?.spinSize } }
				onMouseDown={ onThumbMouseDown }
			/>
		</div>
	)
}

export default ScrollBar
