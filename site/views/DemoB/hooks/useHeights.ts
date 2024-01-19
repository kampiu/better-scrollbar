import { findDOMNode } from "../utils"
import React, { useCallback, useRef, useState, useEffect } from "react"
import raf from "../raf"

export default () => {
	
	const instanceRef = useRef(new Map<React.Key, HTMLElement>())
	const heightsRef = useRef(new Map())
	const [updatedMark, setUpdatedMark] = useState(0)
	const collectRafRef = useRef<number>(-1)
	
	const cancelRaf = useCallback(() => {
		raf.cancel(collectRafRef.current)
	}, [])
	
	const collectHeight = useCallback((sync = false) => {
		cancelRaf()
		
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
		
		if (sync) {
			doCollect()
		} else {
			collectRafRef.current = raf(doCollect)
		}
	}, [])
	
	const setInstanceRef = useCallback<(item: React.ReactElement, instance: HTMLElement) => void>((item, instance) => {
		const key = item?.key as React.Key
		if (instance) {
			instanceRef.current.set(key, instance)
			collectHeight()
		} else {
			instanceRef.current.delete(key)
		}
	}, [])
	
	useEffect(() => {
		return cancelRaf
	}, [])
	
	return {setInstanceRef, collectHeight, heights: heightsRef.current, updatedMark}
}
