import React, {
	PropsWithChildren,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	Children,
	useState,
} from "react"
import { flushSync } from "react-dom"
import raf from "./raf"
import { useImmer } from "use-immer"
import { Item } from "./Item"
import useHeights from "./hooks/useHeights"
import VerticalScrollBar, { VerticalScrollBarRef } from "./VerticalScrollBar"
import { getSpinSize } from "./scrollUtil"
import { ScrollState, Size } from "./types"
import useResizeObserver from "./hooks/useResizeObserver"
import clsx from "clsx"
import "./init.less"

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
	/** 外层容器样式 */
	className?: string
	/** 样式前缀 */
	prefixCls?: string
	/** 滚动容器宽度 */
	width?: number
	/** 滚动容器高度 */
	height?: number
	/** 当前可查看的数据 */
	onVisibleChange?: () => void
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
		prefixCls = "scroll-bar"
	} = props
	
	const childNodes = useMemo(() => {
		return (typeof children === "function" ? [children] : Children.toArray(children)) as Array<React.ReactElement>
	}, [children])
	
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
	
	const {scrollHeight, start, end, offset: fillerOffset} = useMemo(() => {
		let itemTop = 0
		let startIndex: number | undefined
		let startOffset: number | undefined
		let endIndex: number | undefined
		
		for (let i = 0, len = childNodes.length; i < len; i++) {
			const key = childNodes[i]?.key as React.Key
			
			const cacheHeight = heights[key]
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
	}, [childNodes, scrollState.y, updatedMark, size.height])
	
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
		
		// 同步滚动状态
		flushSync(() => {
			onScroll?.(scrollState)
		})
		delayScrollStateChange()
	}, [])
	
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
			<VerticalScrollBar
				prefixCls={ prefixCls }
				ref={ verticalScrollBarInstance }
				scrollState={ scrollState }
				scrollRange={ scrollHeight }
				containerSize={ size.height }
				spinSize={ getSpinSize(size.height, scrollHeight) }
				onScroll={ onUpdateScrollState }
			/>
		</div>
	)
}

export default VirtualScrollBar
