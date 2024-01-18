import { findDOMNode } from "../utils"
import React, { useCallback, useRef, useState } from "react"

export default () => {
	
	const instanceRef = useRef(new Map<React.Key, HTMLElement>())
	const heightsRef = useRef(new Map())
	const [updatedMark, setUpdatedMark] = useState(0)
	
	const collectHeight = useCallback((sync = false) =>  {
		const doCollect = () => {
			instanceRef.current.forEach((element, key) => {
				if (element && element.offsetParent) {
					const htmlElement = findDOMNode<HTMLElement>(element)
					const {offsetHeight} = htmlElement
					if (heightsRef.current.get(key) !== offsetHeight) {
						heightsRef.current.set(key, htmlElement.offsetHeight)
					}
				}
			})
			setUpdatedMark(v => v + 1)
		}
		
		
		// if (sync) {
			doCollect();
		// } else {
		// 	collectRafRef.current = raf(doCollect);
		// }
	}, [])
	
	const setInstanceRef = useCallback((item: any, index: number,instance: HTMLElement) => {
		// const key = item.key
		// const origin = instanceRef.current.get(key)
		
		if (instance) {
			instanceRef.current.set(index, instance)
			collectHeight()
		} else {
			instanceRef.current.delete(index)
		}
	}, [])
	
	
	return [setInstanceRef, collectHeight, heightsRef.current, updatedMark]
}
