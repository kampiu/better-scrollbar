import React, { useEffect, useMemo, useRef, useState } from "react"
import { MockData } from "./mock"
import { useImmer } from "use-immer"
import "./DemoB.less"
import { Item } from "./Item"
import useHeights from "./hooks/useHeights"
import ScrollBar from "./ScrollBar"
import { getSpinSize } from "./scrollUtil"

const TableWidth = 500
const TableHeight = 500

function DemoB() {
	
	const scrollerRef = useRef<HTMLDivElement>({} as HTMLDivElement)
	const scrollRef = useRef<HTMLDivElement>({} as HTMLDivElement)
	const scrollWrapperRef = useRef<HTMLDivElement>({} as HTMLDivElement)
	const [setInstanceRef, collectHeight, heights, updatedMark] = useHeights()
	
	const [scrollState, setScrollState] = useImmer({
		x: 0,
		y: 0
	})
	
	const wheelingRef = useRef<number | null>(null)
	const verticalScrollRef = useRef<HTMLDivElement>({} as HTMLDivElement)
	const horizontalScrollRef = useRef<HTMLDivElement>({} as HTMLDivElement)
	const [offsetTop, setOffsetTop] = useState(0)
	const [offsetLeft, setOffsetLeft] = useState(0)
	const [scrollMoving, setScrollMoving] = useState(false)
	
	const maxScrollHeight = MockData.length * 40 - TableHeight
	const maxScrollHeightRef = useRef(maxScrollHeight)
	maxScrollHeightRef.current = maxScrollHeight
	
	function keepInRange(newScrollTop: number) {
		let newTop = newScrollTop
		if (!Number.isNaN(maxScrollHeightRef.current)) {
			newTop = Math.min(newTop, maxScrollHeightRef.current)
		}
		newTop = Math.max(newTop, 0)
		return newTop
	}
	
	useEffect(() => {
		const onScroll = (event: MouseEvent<HTMLDivElement>) => {
			event?.preventDefault()
			
			if (wheelingRef.current) return
			const {deltaX, deltaY} = event
			
			const StepY = 360
			const StepX = 360
			
			// 滚动方向重置以及滚动大小控制  按住 shift 时，调换滚轮方向
			const scrollTop = event.shiftKey
				? Math.max(Math.min(deltaX, StepX), -StepX)
				: Math.max(Math.min(deltaY, StepY), -StepY)
			
			wheelingRef.current = window.requestAnimationFrame(() => {
				if (wheelingRef.current) {
					window.cancelAnimationFrame(wheelingRef.current)
				}
				wheelingRef.current = null
				collectHeight()
				
				setOffsetTop(v => {
					const result = keepInRange(Math.max(v + scrollTop, 0))
					scrollerRef.current.scrollTop = result
					return result
				})
			})
		}
		
		scrollRef.current?.addEventListener("wheel", onScroll)
		return () => {
			scrollRef.current?.removeEventListener("wheel", onScroll)
		}
	}, [])
	
	const {scrollHeight, start, end, offset: fillerOffset} = useMemo(() => {
		let itemTop = 0
		let startIndex: number | undefined
		let startOffset: number | undefined
		let endIndex: number | undefined
		
		for (let i = 0, len = MockData.length; i < len; i++) {
			const key = i
			
			const cacheHeight = heights.get(key)
			const currentItemBottom = itemTop + (cacheHeight === undefined ? 40 : cacheHeight)
			
			// Check item top in the range
			if (currentItemBottom >= offsetTop && startIndex === undefined) {
				startIndex = i
				startOffset = itemTop
			}
			
			// Check item bottom in the range. We will render additional one item for motion usage
			if (currentItemBottom > offsetTop + TableHeight && endIndex === undefined) {
				endIndex = i
			}
			
			itemTop = currentItemBottom
		}
		// When scrollTop at the end but data cut to small count will reach this
		if (startIndex === undefined) {
			startIndex = 0
			startOffset = 0
			
			endIndex = Math.ceil(TableHeight / 40)
		}
		if (endIndex === undefined) {
			endIndex = MockData.length - 1
		}
		
		// Give cache to improve scroll experience
		endIndex = Math.min(endIndex + 1, MockData.length - 1)
		return {
			scrollHeight: itemTop,
			start: startIndex,
			end: endIndex,
			offset: startOffset,
		}
	}, [MockData, offsetTop, updatedMark])
	
	const listChildren = useMemo(() => {
		return MockData.slice(start, end + 1).map((item, index) => {
			const Component = (
				<div className="item" key={ item }>
					{ item }
				</div>
			)
			return (
				<Item key={ item } setRef={ (ele) => setInstanceRef(Component, index, ele) }>
					{ Component }
				</Item>
			)
		})
	}, [MockData, start, end, setInstanceRef])
	
	return (
		<div className="list-wrapper">
			<div className="list" ref={ scrollerRef } style={ {width: TableWidth, height: TableHeight} }>
				<div className="scroll"
				     onScroll={ e => e.preventDefault() }
				     ref={ scrollRef }
				     style={ {height: MockData.length * 40} }
				>
					<div
						ref={ scrollWrapperRef }
						className="scroll-wrapper"
						style={ {transform: `translateY(${ fillerOffset }px)`} }
					>
						{ listChildren }
					</div>
				</div>
			</div>
			<ScrollBar
				scrollOffset={offsetTop}
				scrollRange={ scrollHeight }
				containerSize={ TableHeight }
				spinSize={ getSpinSize(TableHeight, scrollHeight) }
				onScroll={ (newOffsetTop: number) => {
					setOffsetTop(preOffsetTop => {
						// const result = keepInRange(Math.max(v + scrollTop, 0))
						const result = keepInRange(newOffsetTop)
						scrollerRef.current.scrollTop = result
						return result
					})
				} }
			/>
		</div>
	)
}

export default DemoB
