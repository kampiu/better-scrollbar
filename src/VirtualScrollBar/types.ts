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
