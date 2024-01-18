import { useCallback, useRef, useState } from "react"
import { type TimeoutID, cancelTimeout, requestTimeout } from "../utils"
import type { IScrollerStore } from "../context/Scroller"

export const ScrollerState: IScrollerStore = {
	x: 0,
	y: 0,
}

/** 滚动重置时间 */
const RESET_SCROLL_EVENTS_DEBOUNCE_INTERVAL = 300

interface ScrollerHookProps {
	maxScrollHeight: number
	maxScrollWidth: number
}

function useScroller({maxScrollHeight, maxScrollWidth}: ScrollerHookProps) {
	const [scrollState, setScrollState] = useState<IScrollerStore>(ScrollerState)
	
	const [isScrolling, setScrolling] = useState(false)
	
	const resetIsScrollingTimeoutID = useRef<TimeoutID | null>({} as null | TimeoutID)
	
	/**
	 * @description 重置滚动状态
	 */
	const resetIsScrolling = useCallback(() => {
		resetIsScrollingTimeoutID.current = null
		setScrolling(false)
	}, [])
	
	/**
	 * @description 重置滚动方法
	 */
	const resetIsScrollingDebounced = useCallback(() => {
		if (resetIsScrollingTimeoutID.current !== null) {
			cancelTimeout(resetIsScrollingTimeoutID.current)
		}
		resetIsScrollingTimeoutID.current = requestTimeout(
			resetIsScrolling,
			RESET_SCROLL_EVENTS_DEBOUNCE_INTERVAL,
		)
	}, [])
	
	const setScrollStateAction = useCallback((stateChangeFunction) => {
		setScrolling(true)
		setScrollState(stateChangeFunction)
		resetIsScrollingDebounced()
	}, [])
	
	/**
	 * @description Y轴滚动
	 */
	const onVerticalScroll = useCallback(
		(scrollY: number) => {
			let top = scrollY
			if (top > maxScrollHeight) top = maxScrollHeight
			if (top < 0) top = 0
			setScrollStateAction((scrollCacheState: IScrollerStore) => ({
				x: scrollCacheState.x,
				y: top,
			}))
		},
		[maxScrollHeight],
	)
	
	/**
	 * @description X轴滚动
	 */
	const onHorizontalScroll = useCallback(
		(scrollX: number) => {
			let left = scrollX
			if (left > maxScrollWidth) left = maxScrollWidth
			if (left < 0) left = 0
			setScrollStateAction((scrollCacheState: IScrollerStore) => ({
				y: scrollCacheState.y,
				x: left,
			}))
		},
		[maxScrollWidth],
	)
	
	return {
		scrollState,
		isScrolling,
		setScrollState: setScrollStateAction,
		onHorizontalScroll,
		onVerticalScroll,
	}
}

export default useScroller
