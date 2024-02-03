import { render } from "@testing-library/react"
import VirtualScrollBar, { VirtualScrollBarRef } from "../src"
import React, { createRef } from "react"
import { expect } from "@jest/globals"
import { act } from "react-dom/test-utils"
import "../src/styles/index.less"
import "@testing-library/jest-dom"
import "@jest/globals"

const mockData = Array.from({length: 20}, (_, i) => i)

describe("VirtualScrollBar", () => {
	
	it("matches snapshot", () => {
		const {container} = render(
			<VirtualScrollBar width={ 600 } height={ 600 }>
				{ mockData.map(i => <div key={ i } style={ {height: 50} }>{ i }</div>) }
			</VirtualScrollBar>
		)
		expect(container.firstChild).toMatchSnapshot()
	})
	
	it("renders without crashing", () => {
		const {container} = render(<VirtualScrollBar/>)
		expect(container.querySelector(".scroll-bar-wrapper")).toBeInTheDocument()
	})
	
	it("calls onScrollStart and onScrollEnd when scrolling starts and ends", () => {
		const handleScrollStart = jest.fn()
		const preventDefault = jest.fn()
		const {container} = render(
			<VirtualScrollBar
				width={ 100 }
				height={ 100 }
				onScrollStart={ handleScrollStart }
			>
				{ mockData.map(i => <div key={ i } style={ {height: 50} }>{ i }</div>) }
			</VirtualScrollBar>
		)
		const scrollContainer = container.querySelector(".scroll-bar-container") as Element
		const wheelEvent = new WheelEvent("wheel", {deltaY: 100})
		wheelEvent.preventDefault = preventDefault
		act(() => {
			scrollContainer.dispatchEvent(wheelEvent)
			jest.useFakeTimers()
		})
		expect(preventDefault).toHaveBeenCalledTimes(1)
	})
	
	it("renders without children", () => {
		const {container} = render(<VirtualScrollBar/>)
		expect(container.firstChild).toBeInTheDocument()
	})
	
	it("renders with multiple children", () => {
		const {container} = render(
			<VirtualScrollBar>
				<div>Child 1</div>
				<div>Child 2</div>
				<div>Child 3</div>
			</VirtualScrollBar>
		)
		expect(container.firstChild).toBeInTheDocument()
	})
	
	it("updates scroll position when scrolling", () => {
		const ref = createRef<VirtualScrollBarRef>()
		const {container} = render(
			<VirtualScrollBar height={ 50 } ref={ ref }>
				{ mockData.map((i) => (
					<div key={ i } style={ {height: 50} }>
						{ i }
					</div>
				)) }
			</VirtualScrollBar>
		)
		const scrollContainer = container.querySelector(".scroll-bar-container") as Element
		const scrollY = 100
		const wheelEvent = new WheelEvent("wheel", {deltaY: scrollY})
		act(() => {
			scrollContainer.dispatchEvent(wheelEvent)
			jest.runAllTimers()
		})
		const {y} = ref.current?.getScrollState() || {}
		expect(y).toBe(scrollY)
	})
	
	it("updates scroll position when window resizes", () => {
		const ref = createRef<VirtualScrollBarRef>()
		const {container} = render(
			<VirtualScrollBar ref={ ref }>
				{ mockData.map((i) => (
					<div key={ i } style={ {height: 50} }>
						{ i }
					</div>
				)) }
			</VirtualScrollBar>
		)
		const scrollContainer = container.querySelector(".scroll-bar-container") as Element
		const initialScrollTop = scrollContainer.scrollHeight
		act(() => {
			window.dispatchEvent(new Event("resize"))
			jest.runAllTimers()
		})
		const {scrollHeight} = ref.current?.getScrollState() || {}
		expect(scrollHeight).not.toBe(initialScrollTop)
	})
	
	it("use ref to scroll to a specific position", () => {
		const ref = createRef<VirtualScrollBarRef>()
		render(
			<VirtualScrollBar ref={ ref }>
				{ mockData.map((i) => (
					<div key={ i } style={ {height: 50} }>
						{ i }
					</div>
				)) }
			</VirtualScrollBar>
		)
		const scrollY = 200
		act(() => {
			ref.current?.scrollTo({x: 0, y: scrollY})
			jest.runAllTimers()
		})
		const {y} = ref.current?.getScrollState() || {}
		expect(y).toBe(scrollY)
	})
	
})
