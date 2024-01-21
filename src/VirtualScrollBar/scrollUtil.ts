const MIN_SIZE = 25;
/**
 * @description 获取滚动条的大小
 * @param {number} containerSize 滚动视区高度
 * @param {number} scrollRange 实际滚动高度
 */
export function getSpinSize(containerSize: number = 0, scrollRange: number = 0) {
	let baseSize = (containerSize / scrollRange) * 100;
	if (isNaN(baseSize)) {
		baseSize = 0;
	}
	baseSize = Math.max(baseSize, MIN_SIZE);
	baseSize = Math.min(baseSize, containerSize / 2);
	return Math.floor(baseSize);
}

