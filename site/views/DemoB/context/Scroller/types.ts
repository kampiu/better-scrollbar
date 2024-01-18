/** 滚动hooks元数据 */
export type IScrollerStore = {
	/** 当前滚动X轴偏移 */
	x: number
	/** 当前滚动Y轴偏移 */
	y: number
}

/** 依赖注入Props */
export interface ScrollContextProps {
	scrollStore: IScrollerStore
}
