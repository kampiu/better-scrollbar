import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	Children, forwardRef, useImperativeHandle, cloneElement
} from "react"
import type { PropsWithChildren } from "react"
import raf from "./raf"
import { useImmer } from "use-immer"
import { Item } from "./components/Item"
import useHeights from "./hooks/useHeights"
import VerticalScrollBar from "./components/VerticalScrollBar"
import { getSpinSize } from "./scrollUtil"
import { ScrollOffset, ScrollState, VirtualScrollBarProps, VirtualScrollBarRef, ScrollBarRef } from "./types"
import useResizeObserver from "./hooks/useResizeObserver"
import clsx from "clsx"
import {
	renderViewDefault,
	renderTrackVerticalDefault,
	renderThumbVerticalDefault
} from "./defaultRenderElements"

const VirtualScrollBar = forwardRef<VirtualScrollBarRef, PropsWithChildren<VirtualScrollBarProps>>((props, ref) => {
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
		renderView = renderViewDefault,
		renderTrackVertical = renderTrackVerticalDefault,
		renderThumbVertical = renderThumbVerticalDefault,
		// renderThumbHorizontal = renderThumbHorizontalDefault,
		// renderTrackHorizontal = renderTrackHorizontalDefault
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
			
			// 选中范围中的顶部项目
			if (currentItemBottom >= scrollState.y && startIndex === undefined) {
				startIndex = i
				startOffset = itemTop
			}
			
			// 检查范围内的项目底部。我们将渲染额外的一个项目以供运动使用
			if (currentItemBottom > scrollState.y + scrollState.clientHeight && endIndex === undefined) {
				endIndex = i
			}
			
			itemTop = currentItemBottom
		}
		// 当滚动顶部在末尾，但数据被剪切到小计数时，将达到此值
		if (startIndex === undefined) {
			startIndex = 0
			startOffset = 0
			
			endIndex = Math.ceil(scrollState.clientHeight / itemHeight)
		}
		if (endIndex === undefined) {
			endIndex = childNodes.length - 1
		}
		
		// 提供缓存以改善滚动体验
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
		const scrollContainer = scrollContainerRef.current;
		scrollContainer?.addEventListener("wheel", onScroll)
		return () => {
			scrollContainer?.removeEventListener("wheel", onScroll)
			raf.cancel(wheelingRaf.current)
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
	
	// 当数据大小减小时。它可能会触发本地滚动事件以适应滚动位置
	const onFallbackScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
		const {scrollTop: newScrollTop} = event.currentTarget
		if (newScrollTop !== scrollState.y) {
			onUpdateScrollState(newScrollTop)
		}
	}, [scrollState])
	
	useImperativeHandle(ref, (): VirtualScrollBarRef => {
		return {
			scrollTo(offset: ScrollOffset) {
				onUpdateScrollState(offset.y)
			},
			getScrollState() {
				return scrollState
			},
			resizeObserver(callback) {
				callback({
					clientWidth: scrollState.clientWidth,
					clientHeight: scrollState.clientHeight,
					scrollWidth: scrollState.scrollWidth,
					scrollHeight: scrollState.scrollHeight,
				})
			}
		}
	})
	
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
					{
						cloneElement(
							renderView({
								className: clsx(`${ prefixCls }-wrapper`),
								style: {transform: `translateY(${ fillerOffset }px)`}
							}),
							{},
							listChildren
						)
					}
				</div>
			</div>
			<VerticalScrollBar
				prefixCls={ prefixCls }
				ref={ verticalScrollBarInstance }
				hidden={ scrollBarHidden }
				thumbSize={ {
					height: getSpinSize(scrollState.clientHeight, scrollHeight),
					width: scrollBarSize
				} }
				renderTrack={ renderTrackVertical }
				renderThumb={ renderThumbVertical }
				autoHideTimeout={ scrollBarAutoHideTimeout }
				scrollState={ scrollState }
				scrollRange={ scrollHeight }
				containerSize={ scrollState.clientHeight }
				onScroll={ onUpdateScrollState }
			/>
		</div>
	)
})

export default VirtualScrollBar
