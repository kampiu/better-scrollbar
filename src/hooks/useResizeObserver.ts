import { useLayoutEffect, useRef } from "react"
import type { MutableRefObject } from "react"
import raf from "../raf"

export default (ref: MutableRefObject<HTMLDivElement>, callback: (size: { width: number, height: number }) => void) => {
	const collectRafRef = useRef<number>(-1)
	
	useLayoutEffect(() => {
		const target = ref.current
		const resizeObserverCallback = () => {
			const {width = 0, height = 0} = target?.getBoundingClientRect?.() || {}
			collectRafRef.current = raf(() => {
				callback?.({width, height})
			})
		}
		const timer = new ResizeObserver(resizeObserverCallback)
		timer?.observe?.(target)
		return () => {
			timer?.disconnect?.()
			raf.cancel(collectRafRef.current)
		}
	}, [])
}
