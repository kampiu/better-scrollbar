import { useEffect, useRef } from "react"
import type { MutableRefObject } from "react"
import raf from "../raf"
import { Size } from "../types"

export default (ref: MutableRefObject<HTMLDivElement>, callback: (size: Size) => void) => {
	const collectRafRef = useRef<number>(-1)
	
	useEffect(() => {
		const target = ref.current
		const timer = new ResizeObserver(() => {
			const {width = 0, height = 0} = target?.getBoundingClientRect?.() || {}
			collectRafRef.current = raf(() => {
				callback?.({width, height})
			})
		})
		timer?.observe?.(target)
		return () => {
			timer?.disconnect?.()
			raf.cancel(collectRafRef.current)
		}
	}, [])
}

// export default () => {
// 	const collectRafRef = useRef<number>(-1)
//
// 	const resizeObserverRef = useRef<ResizeObserver>()
//
// 	useEffect(() => {
// 		return () => {
// 			resizeObserverRef.current?.disconnect?.()
// 			raf.cancel(collectRafRef.current)
// 		}
// 	}, [])
//
// 	return useCallback((ref: MutableRefObject<HTMLDivElement>, callback: (size: Size) => void) => {
// 		const target = ref.current
// 		resizeObserverRef.current = new ResizeObserver(() => {
// 			const {width = 0, height = 0} = target?.getBoundingClientRect?.() || {}
// 			collectRafRef.current = raf(() => {
// 				callback?.({width, height})
// 			})
// 		})
// 		resizeObserverRef.current?.observe?.(target)
// 	}, [])
// }
