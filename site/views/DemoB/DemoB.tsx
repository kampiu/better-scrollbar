import React, {
	PropsWithChildren,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	Children,
	useState,
	type CSSProperties
} from "react"
import { useImmer } from "use-immer"
import "./DemoB.less"
import { Item } from "./Item"
import useHeights from "./hooks/useHeights"
import VerticalScrollBar, { VerticalScrollBarRef } from "./VerticalScrollBar"
import { getSpinSize } from "./scrollUtil"
import { ScrollState, Size } from "./types"
import useResizeObserver from "./hooks/useResizeObserver"

const TableWidth = 500
const TableHeight = 500

/**
 * props 汇总
 * @param {} onScrollStart 开始滚动回调
 * @param {} onScrollEnd 结束滚动回调
 * @param {} onScroll 滚动更新回调（返回当前滚动的x、y，意味着就是top、left）
 * @param {number} thumbSize 滚动条粗细（配置看看能不能聚合）
 * @param {number} thumbAutoHideTimeout 滚动条隐藏延时
 * @param {number} thumbMinSize 滚动条最小面积
 * @param {boolean} isVirtual 是否需要虚拟滚动
 * @constructor
 */
export interface ScrollBarProps {
	/** 开始滚动回调 */
	onScrollStart?: () => void
	/** 结束滚动回调 */
	onScrollEnd?: () => void
	/** 滚动更新回调 */
	onScroll?: (scrollState: ScrollState) => void
	/** 滚动条粗细 */
	thumbSize?: number
	/** 滚动条隐藏延时 */
	thumbAutoHideTimeout?: number
	/** 滚动条最小长度 */
	thumbMinSize?: number
	/** 是否需要虚拟滚动 */
	isVirtual?: boolean
}

function DemoB(props: PropsWithChildren<ScrollBarProps>) {
	const {
		onScrollStart,
		onScrollEnd,
		children
	} = props
	
	const childNodes = typeof children === "function" ? [children] : Children.toArray(children) as Array<React.ReactElement>
	
	// 滚动视区高宽
	const [size, setSize] = useState<Size>({width: 0, height: 0})
	// 可见视图区域
	const viewContainerRef = useRef<HTMLDivElement>({} as HTMLDivElement)
	// 滚动区域
	const scrollContainerRef = useRef<HTMLDivElement>({} as HTMLDivElement)
	// 滚动条
	const verticalScrollBarInstance = useRef<VerticalScrollBarRef>({} as VerticalScrollBarRef)
	// const horizontalScrollBarInstance = useRef<HTMLDivElement>({} as HTMLDivElement)
	const {setInstanceRef, collectHeight, heights, updatedMark} = useHeights()
	
	const [scrollState, setScrollState] = useImmer<ScrollState>({
		x: 0,
		y: 0,
		isScrolling: false
	})
	
	useResizeObserver(viewContainerRef, (newSize) => {
		setSize(newSize)
	})
	
	const wheelingRef = useRef<number | null>(null)
	
	const {scrollHeight, start, end, offset: fillerOffset} = useMemo(() => {
		let itemTop = 0
		let startIndex: number | undefined
		let startOffset: number | undefined
		let endIndex: number | undefined
		
		for (let i = 0, len = childNodes.length; i < len; i++) {
			const key = childNodes[i]?.key as React.Key
			
			const cacheHeight = heights.get(key)
			const currentItemBottom = itemTop + (cacheHeight === undefined ? 10 : cacheHeight)
			
			// Check item top in the range
			if (currentItemBottom >= scrollState.y && startIndex === undefined) {
				startIndex = i
				startOffset = itemTop
			}
			
			// Check item bottom in the range. We will render additional one item for motion usage
			if (currentItemBottom > scrollState.y + size.height && endIndex === undefined) {
				endIndex = i
			}
			
			itemTop = currentItemBottom
		}
		// When scrollTop at the end but data cut to small count will reach this
		if (startIndex === undefined) {
			startIndex = 0
			startOffset = 0
			
			endIndex = Math.ceil(size.height / 10)
		}
		if (endIndex === undefined) {
			endIndex = childNodes.length - 1
		}
		
		// Give cache to improve scroll experience
		endIndex = Math.min(endIndex + 1, childNodes.length - 1)
		return {
			scrollHeight: itemTop,
			start: startIndex,
			end: endIndex,
			offset: startOffset,
		}
	}, [childNodes, scrollState.y, size.height, updatedMark])
	
	const maxScrollHeight = scrollHeight - size.height
	const maxScrollHeightRef = useRef(maxScrollHeight)
	maxScrollHeightRef.current = maxScrollHeight
	
	function keepInRange(newScrollTop: number) {
		let newTop = newScrollTop
		if (!Number.isNaN(maxScrollHeightRef.current)) {
			newTop = Math.min(newTop, maxScrollHeightRef.current)
		}
		newTop = Math.max(newTop, 0)
		return newTop
	}
	
	const detectScrollingInterval = useRef<ReturnType<typeof setTimeout>>()
	
	/**
	 * @description 延迟"是否滚动"的滚动状态变更
	 */
	const delayScrollStateChange = useCallback(() => {
		clearTimeout(detectScrollingInterval.current)
		
		detectScrollingInterval.current = setTimeout(() => {
			setScrollState((preScrollState) => {
				preScrollState.isScrolling = false
			})
		}, 200)
	}, [])
	
	useEffect(() => {
		if (scrollState.isScrolling) {
			onScrollStart?.()
		} else {
			onScrollEnd?.()
		}
	}, [scrollState.isScrolling])
	
	useEffect(() => {
		const onScroll = function (event: WheelEvent): void {
			event?.preventDefault()
			
			if (wheelingRef.current) return
			const {deltaX, deltaY} = event
			
			const StepY = 360
			const StepX = 360
			
			// 滚动方向重置以及滚动大小控制  按住 shift 时，调换滚轮方向
			const scrollTop = event.shiftKey
				? Math.max(Math.min(deltaX, StepX), -StepX)
				: Math.max(Math.min(deltaY, StepY), -StepY)
			
			wheelingRef.current = window.requestAnimationFrame(() => {
				if (wheelingRef.current) {
					window.cancelAnimationFrame(wheelingRef.current)
				}
				wheelingRef.current = null
				collectHeight()
				
				setScrollState((preScrollState) => {
					preScrollState.y = keepInRange(Math.max(preScrollState.y + scrollTop, 0))
					preScrollState.isScrolling = true
					viewContainerRef.current.scrollTop = preScrollState.y
				})
				
				delayScrollStateChange()
			})
		}
		
		scrollContainerRef.current?.addEventListener("wheel", onScroll)
		return () => {
			scrollContainerRef.current?.removeEventListener("wheel", onScroll)
		}
	}, [])
	
	const listChildren = useMemo(() => {
		return childNodes.slice(start, end + 1).map((node) => {
			return (
				<Item key={ node?.key } setRef={ (ele) => setInstanceRef(node, ele) }>
					{ node }
				</Item>
			)
		})
	}, [childNodes, start, end, setInstanceRef])
	
	const delayHideScrollBar = useCallback(() => {
		verticalScrollBarInstance.current?.delayHiddenScrollBar()
	}, [])
	
	const styles: CSSProperties = {
		overflowY: "hidden",
		position: "relative",
		width: "100%",
		height: "100%",
	}
	
	console.log("--scrollHeight--", scrollHeight)
	return (
		<div
			className="list-wrapper"
		>
			<div
				ref={ viewContainerRef }
				style={styles}
				onMouseEnter={ delayHideScrollBar }
			>
				<div
					ref={ scrollContainerRef }
					className="scroll"
					style={ {height: scrollHeight} }
					onScroll={ event => event.preventDefault() }
				>
					<div
						className="scroll-wrapper"
						style={ {transform: `translateY(${ fillerOffset }px)`} }
					>
						{ listChildren }
					</div>
				</div>
			</div>
			<VerticalScrollBar
				ref={ verticalScrollBarInstance }
				scrollState={ scrollState }
				scrollRange={ scrollHeight }
				containerSize={ size.height }
				spinSize={ getSpinSize(size.height, scrollHeight) }
				onScroll={ (newOffsetTop: number) => {
					setScrollState((preScrollState) => {
						const result = keepInRange(newOffsetTop)
						viewContainerRef.current.scrollTop = result
						preScrollState.y = result
					})
					delayScrollStateChange()
				} }
			/>
		</div>
	)
}

export default DemoB
