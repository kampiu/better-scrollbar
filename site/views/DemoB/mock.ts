
/** 字符串类型 */
export const enum RandomStringType {
	/** 默认类型（大小写字母+数字） */
	Default = "default",
	/** 数字类型 */
	Number = "number",
	/** 大写字母类型 */
	LowerCase = "lowerCase",
	/** 小写字母类型 */
	UpperCase = "upperCase"
}

/**
 * @description 随机生成范围内数字
 * @param {number} min 最小范围
 * @param {number} max 最大范围
 */
export const random = (min: number = 0, max: number = 100) =>
	Math.floor(Math.random() * (max - min + 1)) + min

/**
 * @description 随机生成不同类型的指定长度字符串
 * @param {number} len 字符串长度
 * @param {RandomStringType} type 字符串类型
 */
export const randomString = (
	len: number = 64,
	type: RandomStringType = RandomStringType.Default
): string => {
	const strMap: Record<RandomStringType, string> = {
		[RandomStringType.Default]:
			"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
		[RandomStringType.Number]: "0123456789",
		[RandomStringType.LowerCase]: "abcdefghijklmnopqrstuvwxyz",
		[RandomStringType.UpperCase]: "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
	}
	let result = ""
	const str = strMap[type]
	// eslint-disable-next-line no-plusplus
	while (len--) {
		result += str[random(0, str.length - 1)]
	}
	return result
}

export const MockData = Array.from({length: 100}, (_i, j) => {
	return {
		id: randomString(8),
		sort: j
	}
})

