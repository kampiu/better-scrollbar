/** 滚动状态 */
export interface ScrollState {
	/** X轴滚动偏移 */
	x: number
	/** Y轴滚动偏移 */
	y: number
	/** 是否正在滚动 */
	isScrolling: boolean
}

/** 容器尺寸 */
export interface Size {
	/** 容器宽度 */
	width: number
	/** 容器高度 */
	height: number
}
