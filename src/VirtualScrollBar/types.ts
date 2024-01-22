import { HTMLProps, PropsWithChildren, ReactElement } from "react"

/** 滚动状态 */
export interface ScrollState {
	/** X轴滚动偏移 */
	x: number
	/** Y轴滚动偏移 */
	y: number
	/** 可滚动宽度 */
	scrollWidth: number
	/** 可滚动高度 */
	scrollHeight: number
	/** 滚动视区宽度 */
	clientWidth: number
	/** 滚动视区高度 */
	clientHeight: number
	/** 是否正在滚动 */
	isScrolling: boolean
}

/** 滚动偏移 */
export interface ScrollOffset {
	/** X轴上的偏移 */
	x: number
	/** Y轴上的偏移 */
	y: number
}

/** 渲染元素 */
export type RenderElement<Props> = (props?: PropsWithChildren<Props>) => ReactElement

// (props?: PropsWithChildren<Props>) => ReactElement | ForwardRefExoticComponent<PropsWithoutRef<Instance> & RefAttributes<PropsWithChildren<Props>>>

/** 组件Props */
export interface VirtualScrollBarProps {
	/** 开始滚动回调 */
	onScrollStart?: () => void
	/** 结束滚动回调 */
	onScrollEnd?: () => void
	/**
	 * @description 滚动回调
	 * @param {ScrollState} scrollState 滚动状态
	 */
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
	/**
	 * @description 绘制滚动区域
	 * @param {(HTMLAttributes<HTMLDivElement>) => React.ReactElement} props
	 */
	renderView?: RenderElement<HTMLProps<HTMLDivElement>>
}

export interface VirtualScrollBarRef {
	/** 滚动到指定位置 */
	scrollTo: (offset: ScrollOffset) => void
	/** 获取当前的滚动数据 */
	getScrollState: () => ScrollState
	/** 滚动、视区中的高宽变化回调 */
	resizeObserver: (callback: (resizeState: Pick<ScrollState, "scrollWidth" | "scrollHeight" | "clientWidth" | "clientHeight">) => void) => void
}
