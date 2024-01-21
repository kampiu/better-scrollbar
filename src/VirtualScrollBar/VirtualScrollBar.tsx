import React, {
	PropsWithChildren,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	Children,
} from "react"
import raf from "./raf"
import { useImmer } from "use-immer"
import { Item } from "./components/Item"
import useHeights from "./hooks/useHeights"
import ScrollBar, { ScrollBarRef } from "./components/ScrollBar"
import { getSpinSize } from "./scrollUtil"
import { ScrollState } from "./types"
import useResizeObserver from "./hooks/useResizeObserver"
import clsx from "clsx"
import "./VirtualScrollBar.less"

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
	/** 是否需要虚拟滚动 */
	isVirtual?: boolean
	/** 外层容器样式 */
	className?: string
	/** 单条数据默认高度 */
	itemHeight?: number
	/** 样式前缀 */
	prefixCls?: string
	/** 滚动容器宽度 */
	width?: number
	/** 滚动容器高度 */
	height?: number
	/** 滚动条粗细 */
	scrollBarSize?: number
	/** 滚动条是否隐藏 */
	scrollBarHidden?: boolean
	/** 滚动条隐藏延时 */
	scrollBarAutoHideTimeout?: number
}

function VirtualScrollBar(props: PropsWithChildren<ScrollBarProps>) {
	const {
		onScrollStart,
		onScrollEnd,
		onScroll,
		children,
		width,
		height,
		className,
		prefixCls = "scroll-bar",
		itemHeight = 20,
		scrollBarSize = 6,
		scrollBarHidden = false,
		scrollBarAutoHideTimeout = 1000,
	} = props
	
	const childNodes = useMemo(() => {
		return (typeof children === "function" ? [children] : Children.toArray(children)) as Array<React.ReactElement>
	}, [children])
	
	// 可见视图区域
	const viewContainerRef = useRef<HTMLDivElement>({} as HTMLDivElement)
	// 滚动区域
	const scrollContainerRef = useRef<HTMLDivElement>({} as HTMLDivElement)
	// 滚动条
	const verticalScrollBarInstance = useRef<ScrollBarRef>({} as ScrollBarRef)
	// const horizontalScrollBarInstance = useRef<HTMLDivElement>({} as HTMLDivElement)
	const {setInstanceRef, collectHeight, heights, updatedMark} = useHeights()
	
	const [scrollState, setScrollState] = useImmer<ScrollState>({
		x: 0,
		y: 0,
		scrollHeight: 0,
		scrollWidth: 0,
		clientHeight: 0,
		clientWidth: 0,
		isScrolling: false
	})
	
	useResizeObserver(viewContainerRef, (newSize) => {
		setScrollState((preScrollState) => {
			preScrollState.clientHeight = newSize.height
			preScrollState.clientWidth = newSize.width
		})
	})
	
	const {scrollHeight, start, end, offset: fillerOffset} = useMemo(() => {
		let itemTop = 0
		let startIndex: number | undefined
		let startOffset: number | undefined
		let endIndex: number | undefined
		
		for (let i = 0, len = childNodes.length; i < len; i++) {
			const key = childNodes[i]?.key as React.Key
			
			const cacheHeight = heights.get(key)
			const currentItemBottom = itemTop + (cacheHeight === undefined ? itemHeight : cacheHeight)
			
			// Check item top in the range
			if (currentItemBottom >= scrollState.y && startIndex === undefined) {
				startIndex = i
				startOffset = itemTop
			}
			
			// Check item bottom in the range. We will render additional one item for motion usage
			if (currentItemBottom > scrollState.y + scrollState.clientHeight && endIndex === undefined) {
				endIndex = i
			}
			
			itemTop = currentItemBottom
		}
		// When scrollTop at the end but data cut to small count will reach this
		if (startIndex === undefined) {
			startIndex = 0
			startOffset = 0
			
			endIndex = Math.ceil(scrollState.clientHeight / itemHeight)
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
	}, [itemHeight, childNodes, scrollState.y, updatedMark, scrollState.clientHeight])
	
	useEffect(() => {
		setScrollState((preScrollState) => {
			preScrollState.scrollHeight = scrollHeight
		})
	}, [scrollHeight])
	
	const maxScrollHeight = scrollHeight - scrollState.clientHeight
	const maxScrollHeightRef = useRef(maxScrollHeight)
	maxScrollHeightRef.current = maxScrollHeight
	
	const keepInRange = useCallback((newScrollTop: number) => {
		let newTop = newScrollTop
		if (!Number.isNaN(maxScrollHeightRef.current)) {
			newTop = Math.min(newTop, maxScrollHeightRef.current)
		}
		newTop = Math.max(newTop, 0)
		return newTop
	}, [])
	
	const detectScrollingInterval = useRef<ReturnType<typeof setTimeout>>()
	
	const onUpdateScrollState = useCallback((scrollTop: number | ((preScrollTop: number) => number)) => {
		setScrollState((preScrollState) => {
			if (typeof scrollTop === "function") {
				preScrollState.y = scrollTop(preScrollState.y)
			} else {
				preScrollState.y = scrollTop
			}
			preScrollState.isScrolling = true
			viewContainerRef.current.scrollTop = preScrollState.y
		})
		
		delayScrollStateChange()
	}, [])
	
	useEffect(() => {
		onScroll?.(scrollState)
	}, [scrollState])
	
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
	
	const wheelingRaf = useRef<number>(-1)
	
	useEffect(() => {
		const onScroll = function (event: WheelEvent): void {
			event?.preventDefault()
			
			const {deltaX, deltaY} = event
			
			const StepY = 360
			const StepX = 360
			
			// 滚动方向重置以及滚动大小控制  按住 shift 时，调换滚轮方向
			const scrollTop = event.shiftKey
				? Math.max(Math.min(deltaX, StepX), -StepX)
				: Math.max(Math.min(deltaY, StepY), -StepY)
			
			wheelingRaf.current = raf(() => {
				raf.cancel(wheelingRaf.current)
				collectHeight()
				
				onUpdateScrollState((preScrollStateY) => {
					return keepInRange(Math.max(preScrollStateY + scrollTop, 0))
				})
			})
		}
		
		scrollContainerRef.current?.addEventListener("wheel", onScroll)
		return () => {
			raf.cancel(wheelingRaf.current)
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
	
	// When data size reduce. It may trigger native scroll event back to fit scroll position
	const onFallbackScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
		const {scrollTop: newScrollTop} = event.currentTarget
		if (newScrollTop !== scrollState.y) {
			onUpdateScrollState(newScrollTop)
		}
	}, [scrollState])
	
	return (
		<div style={ {width, height} } className={ clsx(className, `${ prefixCls }-outer-container`) }>
			<div
				ref={ viewContainerRef }
				style={ {width, height} }
				className={ clsx(`${ prefixCls }-inner-container`) }
				onMouseEnter={ delayHideScrollBar }
				onScroll={ onFallbackScroll }
			>
				<div
					ref={ scrollContainerRef }
					style={ {height: scrollHeight} }
					className={ clsx(`${ prefixCls }-container`) }
					onScroll={ event => event.preventDefault() }
				>
					<div
						className={ clsx(`${ prefixCls }-wrapper`) }
						style={ {transform: `translateY(${ fillerOffset }px)`} }
					>
						{ listChildren }
					</div>
				</div>
			</div>
			<ScrollBar
				prefixCls={ prefixCls }
				ref={ verticalScrollBarInstance }
				hidden={ scrollBarHidden }
				thumbSize={ {
					height: getSpinSize(scrollState.clientHeight, scrollHeight),
					width: scrollBarSize
				} }
				autoHideTimeout={ scrollBarAutoHideTimeout }
				scrollState={ scrollState }
				scrollRange={ scrollHeight }
				containerSize={ scrollState.clientHeight }
				onScroll={ onUpdateScrollState }
			/>
		</div>
	)
}

export default VirtualScrollBar
