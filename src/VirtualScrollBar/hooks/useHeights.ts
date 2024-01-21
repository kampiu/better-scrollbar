import { findDOMNode } from "../utils"
import React, { useCallback, useRef, useState, useEffect } from "react"
import raf from "../raf"

export default () => {
	
	const instanceRef = useRef<Map<React.Key, HTMLElement>>(new Map())
	const heightsRef = useRef<Map<React.Key, number>>(new Map())
	const [updatedMark, setUpdatedMark] = useState(0)
	const collectRafRef = useRef<number>(-1)
	
	const cancelRaf = useCallback(() => {
		raf.cancel(collectRafRef.current)
	}, [])
	
	const collectHeight = (sync = false) => {
		cancelRaf()
		
		const doCollect = () => {
			instanceRef.current.forEach((element, key) => {
				if (element && element.offsetParent) {
					const htmlElement = findDOMNode<HTMLElement>(element)
					const {offsetHeight} = htmlElement || {}
					if (heightsRef.current.get(key) !== offsetHeight && htmlElement) {
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
	}
	
	const setInstanceRef = (item: React.ReactElement, instance: HTMLElement) => {
		const key = item?.key as React.Key
		if (instance) {
			instanceRef.current.set(key, instance)
			collectHeight()
		} else {
			instanceRef.current.delete(key)
		}
	}
	
	useEffect(() => {
		return cancelRaf
	}, [])
	
	return {setInstanceRef, collectHeight, heights: heightsRef.current, updatedMark}
}
