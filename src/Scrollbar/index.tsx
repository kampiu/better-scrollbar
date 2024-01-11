import raf, { cancel as caf } from "raf"
import css from "dom-css"
import React, {
	Component,
	createElement,
	cloneElement
} from "react"
import type {
	HTMLAttributes
} from "react"

import isString from "../utils/isString"
import getScrollbarWidth from "../utils/getScrollbarWidth"
import returnFalse from "../utils/returnFalse"
import getInnerWidth from "../utils/getInnerWidth"
import getInnerHeight from "../utils/getInnerHeight"

import {
	containerStyleDefault,
	containerStyleAutoHeight,
	viewStyleDefault,
	viewStyleAutoHeight,
	viewStyleUniversalInitial,
	trackHorizontalStyleDefault,
	trackVerticalStyleDefault,
	thumbHorizontalStyleDefault,
	thumbVerticalStyleDefault,
	disableSelectStyle,
	disableSelectStyleReset
} from "./styles"

import {
	renderViewDefault,
	renderTrackHorizontalDefault,
	renderTrackVerticalDefault,
	renderThumbHorizontalDefault,
	renderThumbVerticalDefault
} from "./defaultRenderElements"

export interface ScrollbarProps {
	onScroll?: (event: Event) => void
	onScrollFrame?: (value: ScrollPosition) => void
	onScrollStart?: () => void
	onScrollStop?: () => void
	onUpdate?: (value: ScrollPosition) => void
	renderView?: (props?: HTMLAttributes<HTMLDivElement>) => React.ReactElement
	renderTrackHorizontal?: (props?: HTMLAttributes<HTMLDivElement>) => React.ReactElement
	renderTrackVertical?: (props?: HTMLAttributes<HTMLDivElement>) => React.ReactElement
	renderThumbHorizontal?: (props?: HTMLAttributes<HTMLDivElement>) => React.ReactElement
	renderThumbVertical?: (props?: HTMLAttributes<HTMLDivElement>) => React.ReactElement
	tagName?: string
	thumbSize?: number
	thumbMinSize?: number
	hideTracksWhenNotNeeded?: boolean
	autoHide?: boolean
	autoHideTimeout?: number
	autoHideDuration?: number
	autoHeight?: boolean
	autoHeightMin?: string | number
	autoHeightMax?: string | number
	universal?: boolean
	style?: React.CSSProperties
	children?: React.ReactNode
}

/** 当前滚动位置信息 */
export interface ScrollPosition {
	left: number
	top: number
	scrollLeft: number
	scrollTop: number
	scrollWidth: number
	scrollHeight: number
	clientWidth: number
	clientHeight: number
}

interface ScrollbarState {
	didMountUniversal: boolean
}

export default class Scrollbar extends Component<ScrollbarProps, ScrollbarState> {
	
	static defaultProps: ScrollbarProps = {
		renderView: renderViewDefault,
		renderTrackHorizontal: renderTrackHorizontalDefault,
		renderTrackVertical: renderTrackVerticalDefault,
		renderThumbHorizontal: renderThumbHorizontalDefault,
		renderThumbVertical: renderThumbVerticalDefault,
		tagName: "div",
		thumbMinSize: 30,
		hideTracksWhenNotNeeded: false,
		autoHide: false,
		autoHideTimeout: 1000,
		autoHideDuration: 200,
		autoHeight: false,
		autoHeightMin: 0,
		autoHeightMax: 200,
		universal: false,
	}
	
	public trackVertical: HTMLElement | undefined = undefined
	public thumbVertical: HTMLElement | undefined = undefined
	public view: HTMLElement | undefined = undefined
	public container: HTMLElement = {} as HTMLElement
	public requestFrame: number | undefined = undefined
	public hideTracksTimeout: ReturnType<typeof setTimeout> | undefined
	public detectScrollingInterval: ReturnType<typeof setInterval> | undefined
	public dragging: boolean = false
	public prevPageX: number = 0
	public prevPageY: number = 0
	public trackMouseOver: boolean = false
	public scrolling: boolean = false
	public lastViewScrollLeft: number = 0
	public lastViewScrollTop: number = 0
	public viewScrollLeft: number = 0
	public viewScrollTop: number = 0
	public trackHorizontal: HTMLElement | undefined = undefined
	public thumbHorizontal: HTMLElement | undefined = undefined
	
	constructor(props: ScrollbarProps) {
		super(props)
		
		this.getScrollLeft = this.getScrollLeft.bind(this)
		this.getScrollTop = this.getScrollTop.bind(this)
		this.getScrollWidth = this.getScrollWidth.bind(this)
		this.getScrollHeight = this.getScrollHeight.bind(this)
		this.getClientWidth = this.getClientWidth.bind(this)
		this.getClientHeight = this.getClientHeight.bind(this)
		this.getPosition = this.getPosition.bind(this)
		this.getThumbHorizontalWidth = this.getThumbHorizontalWidth.bind(this)
		this.getThumbVerticalHeight = this.getThumbVerticalHeight.bind(this)
		this.getScrollLeftForOffset = this.getScrollLeftForOffset.bind(this)
		this.getScrollTopForOffset = this.getScrollTopForOffset.bind(this)
		
		this.scrollLeft = this.scrollLeft.bind(this)
		this.scrollTop = this.scrollTop.bind(this)
		this.scrollToLeft = this.scrollToLeft.bind(this)
		this.scrollToTop = this.scrollToTop.bind(this)
		this.scrollToRight = this.scrollToRight.bind(this)
		this.scrollToBottom = this.scrollToBottom.bind(this)
		
		this.handleTrackMouseEnter = this.handleTrackMouseEnter.bind(this)
		this.handleTrackMouseLeave = this.handleTrackMouseLeave.bind(this)
		this.handleHorizontalTrackMouseDown = this.handleHorizontalTrackMouseDown.bind(this)
		this.handleVerticalTrackMouseDown = this.handleVerticalTrackMouseDown.bind(this)
		this.handleHorizontalThumbMouseDown = this.handleHorizontalThumbMouseDown.bind(this)
		this.handleVerticalThumbMouseDown = this.handleVerticalThumbMouseDown.bind(this)
		this.handleWindowResize = this.handleWindowResize.bind(this)
		this.handleScroll = this.handleScroll.bind(this)
		this.handleDrag = this.handleDrag.bind(this)
		this.handleDragEnd = this.handleDragEnd.bind(this)
		
		this.state = {
			didMountUniversal: false
		}
	}
	
	componentDidMount() {
		this.addListeners()
		this.update()
		this.componentDidMountUniversal()
	}
	
	componentDidMountUniversal() { // eslint-disable-line react/sort-comp
		const {universal} = this.props
		if (!universal) return
		this.setState({didMountUniversal: true})
	}
	
	componentDidUpdate() {
		this.update()
	}
	
	componentWillUnmount() {
		this.removeListeners()
		if (this.requestFrame != undefined) {
			caf(this.requestFrame)
		}
		clearTimeout(this.hideTracksTimeout)
		clearInterval(this.detectScrollingInterval)
	}
	
	getScrollLeft(): number {
		if (!this.view) return 0
		return this.view?.scrollLeft || 0
	}
	
	getScrollTop() {
		if (!this.view) return 0
		return this.view?.scrollTop || 0
	}
	
	getScrollWidth() {
		if (!this.view) return 0
		return this.view?.scrollWidth || 0
	}
	
	getScrollHeight() {
		if (!this.view) return 0
		return this.view?.scrollHeight || 0
	}
	
	getClientWidth() {
		if (!this.view) return 0
		return this.view?.clientWidth || 0
	}
	
	getClientHeight() {
		if (!this.view) return 0
		return this.view?.clientHeight || 0
	}
	
	getPosition(): ScrollPosition {
		const {
			scrollLeft = 0,
			scrollTop = 0,
			scrollWidth = 0,
			scrollHeight = 0,
			clientWidth = 0,
			clientHeight = 0
		} = this.view || {}
		
		return {
			left: (scrollLeft / (scrollWidth - clientWidth)) || 0,
			top: (scrollTop / (scrollHeight - clientHeight)) || 0,
			scrollLeft,
			scrollTop,
			scrollWidth,
			scrollHeight,
			clientWidth,
			clientHeight
		}
	}
	
	getThumbHorizontalWidth() {
		const {thumbSize, thumbMinSize} = this.props
		const {scrollWidth, clientWidth} = this.view as HTMLElement
		const trackWidth = getInnerWidth(this.trackHorizontal as HTMLElement)
		const width = Math.ceil(clientWidth / scrollWidth * trackWidth)
		if (trackWidth === width) return 0
		if (thumbSize) return thumbSize
		return Math.max(width, thumbMinSize || 0)
	}
	
	getThumbVerticalHeight() {
		const {thumbSize, thumbMinSize} = this.props
		const {scrollHeight, clientHeight} = this.view as HTMLElement
		const trackHeight = getInnerHeight(this.trackVertical as HTMLElement)
		const height = Math.ceil(clientHeight / scrollHeight * trackHeight)
		if (trackHeight === height) return 0
		if (thumbSize) return thumbSize
		return Math.max(height, thumbMinSize || 0)
	}
	
	getScrollLeftForOffset(offset: number): number {
		const {scrollWidth = 0, clientWidth = 0} = this.view || {}
		const trackWidth = getInnerWidth(this.trackHorizontal as HTMLElement)
		const thumbWidth = this.getThumbHorizontalWidth()
		return offset / (trackWidth - thumbWidth) * (scrollWidth - clientWidth)
	}
	
	getScrollTopForOffset(offset: number): number {
		const {scrollHeight = 0, clientHeight = 0} = this.view || {}
		const trackHeight = getInnerHeight(this.trackVertical as HTMLElement)
		const thumbHeight = this.getThumbVerticalHeight()
		return offset / (trackHeight - thumbHeight) * (scrollHeight - clientHeight)
	}
	
	scrollLeft(left = 0) {
		if (!this.view) return
		this.view.scrollLeft = left
	}
	
	scrollTop(top = 0) {
		if (!this.view) return
		this.view.scrollTop = top
	}
	
	scrollToLeft() {
		if (!this.view) return
		this.view.scrollLeft = 0
	}
	
	scrollToTop() {
		if (!this.view) return
		this.view.scrollTop = 0
	}
	
	scrollToRight() {
		if (!this.view) return
		this.view.scrollLeft = this.view.scrollWidth
	}
	
	scrollToBottom() {
		if (!this.view) return
		this.view.scrollTop = this.view.scrollHeight
	}
	
	addListeners() {
		/* istanbul ignore if */
		if (typeof document === "undefined" || !this.view) return
		const {view, trackHorizontal, trackVertical, thumbHorizontal, thumbVertical} = this
		view?.addEventListener("scroll", this.handleScroll)
		if (!getScrollbarWidth()) return
		trackHorizontal?.addEventListener("mouseenter", this.handleTrackMouseEnter)
		trackHorizontal?.addEventListener("mouseleave", this.handleTrackMouseLeave)
		trackHorizontal?.addEventListener("mousedown", this.handleHorizontalTrackMouseDown)
		trackVertical?.addEventListener("mouseenter", this.handleTrackMouseEnter)
		trackVertical?.addEventListener("mouseleave", this.handleTrackMouseLeave)
		trackVertical?.addEventListener("mousedown", this.handleVerticalTrackMouseDown)
		thumbHorizontal?.addEventListener("mousedown", this.handleHorizontalThumbMouseDown)
		thumbVertical?.addEventListener("mousedown", this.handleVerticalThumbMouseDown)
		window.addEventListener("resize", this.handleWindowResize)
	}
	
	removeListeners() {
		/* istanbul ignore if */
		if (typeof document === "undefined" || !this.view) return
		const {view, trackHorizontal, trackVertical, thumbHorizontal, thumbVertical} = this
		view.removeEventListener("scroll", this.handleScroll)
		if (!getScrollbarWidth()) return
		trackHorizontal?.removeEventListener("mouseenter", this.handleTrackMouseEnter)
		trackHorizontal?.removeEventListener("mouseleave", this.handleTrackMouseLeave)
		trackHorizontal?.removeEventListener("mousedown", this.handleHorizontalTrackMouseDown)
		trackVertical?.removeEventListener("mouseenter", this.handleTrackMouseEnter)
		trackVertical?.removeEventListener("mouseleave", this.handleTrackMouseLeave)
		trackVertical?.removeEventListener("mousedown", this.handleVerticalTrackMouseDown)
		thumbHorizontal?.removeEventListener("mousedown", this.handleHorizontalThumbMouseDown)
		thumbVertical?.removeEventListener("mousedown", this.handleVerticalThumbMouseDown)
		window.removeEventListener("resize", this.handleWindowResize)
		// Possibly setup by `handleDragStart`
		this.teardownDragging()
	}
	
	handleScroll(event: Event) {
		const {onScroll, onScrollFrame} = this.props
		if (onScroll) onScroll(event)
		this.update(values => {
			const {scrollLeft, scrollTop} = values
			this.viewScrollLeft = scrollLeft
			this.viewScrollTop = scrollTop
			if (onScrollFrame) onScrollFrame(values)
		})
		this.detectScrolling()
	}
	
	handleScrollStart() {
		const {onScrollStart} = this.props
		if (onScrollStart) onScrollStart()
		this.handleScrollStartAutoHide()
	}
	
	handleScrollStartAutoHide() {
		const {autoHide} = this.props
		if (!autoHide) return
		this.showTracks()
	}
	
	handleScrollStop() {
		const {onScrollStop} = this.props
		if (onScrollStop) onScrollStop()
		this.handleScrollStopAutoHide()
	}
	
	handleScrollStopAutoHide() {
		const {autoHide} = this.props
		if (!autoHide) return
		this.hideTracks()
	}
	
	handleWindowResize() {
		this.update()
	}
	
	handleHorizontalTrackMouseDown(event: MouseEvent) {
		event.preventDefault()
		const {target, clientX} = event
		const {left: targetLeft} = (target as HTMLDivElement).getBoundingClientRect()
		const thumbWidth = this.getThumbHorizontalWidth()
		const offset = Math.abs(targetLeft - clientX) - thumbWidth / 2
		;(this.view as HTMLElement).scrollLeft = this.getScrollLeftForOffset(offset)
	}
	
	handleVerticalTrackMouseDown(event: MouseEvent) {
		event.preventDefault()
		const {target, clientY} = event
		const {top: targetTop} = (target as HTMLDivElement).getBoundingClientRect()
		const thumbHeight = this.getThumbVerticalHeight()
		const offset = Math.abs(targetTop - clientY) - thumbHeight / 2
		;(this.view as HTMLElement).scrollTop = this.getScrollTopForOffset(offset)
	}
	
	handleHorizontalThumbMouseDown(event: MouseEvent) {
		event.preventDefault()
		this.handleDragStart(event)
		const {target, clientX} = event
		const {offsetWidth} = (target as HTMLDivElement)
		const {left} = (target as HTMLDivElement).getBoundingClientRect()
		this.prevPageX = offsetWidth - (clientX - left)
	}
	
	handleVerticalThumbMouseDown(event: MouseEvent) {
		event.preventDefault()
		this.handleDragStart(event)
		const {target, clientY} = event
		const {offsetHeight} = (target as HTMLDivElement)
		const {top} = (target as HTMLDivElement).getBoundingClientRect()
		this.prevPageY = offsetHeight - (clientY - top)
	}
	
	setupDragging() {
		css(document.body, disableSelectStyle as { [P in keyof CSSStyleDeclaration]?: string | number })
		document.addEventListener("mousemove", this.handleDrag)
		document.addEventListener("mouseup", this.handleDragEnd)
		document.onselectstart = returnFalse
	}
	
	teardownDragging() {
		css(document.body, disableSelectStyleReset as { [P in keyof CSSStyleDeclaration]?: string | number })
		document.removeEventListener("mousemove", this.handleDrag)
		document.removeEventListener("mouseup", this.handleDragEnd)
		document.onselectstart = null
	}
	
	handleDragStart(event: MouseEvent) {
		this.dragging = true
		event.stopImmediatePropagation()
		this.setupDragging()
	}
	
	handleDrag(event: MouseEvent) {
		if (this.prevPageX) {
			const {clientX} = event
			const {left: trackLeft} = (this.trackHorizontal as HTMLElement).getBoundingClientRect()
			const thumbWidth = this.getThumbHorizontalWidth()
			const clickPosition = thumbWidth - this.prevPageX
			const offset = -trackLeft + clientX - clickPosition
			;(this.view as HTMLElement).scrollLeft = this.getScrollLeftForOffset(offset)
		}
		if (this.prevPageY) {
			const {clientY} = event
			const {top: trackTop} = (this.trackVertical as HTMLElement).getBoundingClientRect()
			const thumbHeight = this.getThumbVerticalHeight()
			const clickPosition = thumbHeight - this.prevPageY
			const offset = -trackTop + clientY - clickPosition
			;(this.view as HTMLElement).scrollTop = this.getScrollTopForOffset(offset)
		}
		return false
	}
	
	handleDragEnd() {
		this.dragging = false
		this.prevPageX = this.prevPageY = 0
		this.teardownDragging()
		this.handleDragEndAutoHide()
	}
	
	handleDragEndAutoHide() {
		const {autoHide} = this.props
		if (!autoHide) return
		this.hideTracks()
	}
	
	handleTrackMouseEnter() {
		this.trackMouseOver = true
		this.handleTrackMouseEnterAutoHide()
	}
	
	handleTrackMouseEnterAutoHide() {
		const {autoHide} = this.props
		if (!autoHide) return
		this.showTracks()
	}
	
	handleTrackMouseLeave() {
		this.trackMouseOver = false
		this.handleTrackMouseLeaveAutoHide()
	}
	
	handleTrackMouseLeaveAutoHide() {
		const {autoHide} = this.props
		if (!autoHide) return
		this.hideTracks()
	}
	
	showTracks() {
		clearTimeout(this.hideTracksTimeout)
		if (this.trackHorizontal) {
			css(this.trackHorizontal, {opacity: 1})
		}
		if (this.trackVertical) {
			css(this.trackVertical, {opacity: 1})
		}
	}
	
	hideTracks() {
		if (this.dragging) return
		if (this.scrolling) return
		if (this.trackMouseOver) return
		const {autoHideTimeout} = this.props
		clearTimeout(this.hideTracksTimeout)
		this.hideTracksTimeout = setTimeout(() => {
			if (this.trackHorizontal) {
				css(this.trackHorizontal, {opacity: 0})
			}
			if (this.trackVertical) {
				css(this.trackVertical, {opacity: 0})
			}
		}, autoHideTimeout)
	}
	
	detectScrolling() {
		if (this.scrolling) return
		this.scrolling = true
		this.handleScrollStart()
		this.detectScrollingInterval = setInterval(() => {
			if (this.lastViewScrollLeft === this.viewScrollLeft
				&& this.lastViewScrollTop === this.viewScrollTop) {
				clearInterval(this.detectScrollingInterval)
				this.scrolling = false
				this.handleScrollStop()
			}
			this.lastViewScrollLeft = this.viewScrollLeft
			this.lastViewScrollTop = this.viewScrollTop
		}, 100)
	}
	
	raf(callback: () => void) {
		if (this.requestFrame) raf.cancel(this.requestFrame)
		this.requestFrame = raf(() => {
			this.requestFrame = undefined
			callback()
		})
	}
	
	update(callback?: (position: ScrollPosition) => void) {
		this.raf(() => this._update(callback))
	}
	
	_update(callback?: (v: ScrollPosition) => void) {
		const {onUpdate, hideTracksWhenNotNeeded} = this.props
		const position: ScrollPosition = this.getPosition()
		if (getScrollbarWidth()) {
			const {scrollLeft, clientWidth, scrollWidth} = position
			const trackHorizontalWidth = getInnerWidth(this.trackHorizontal as HTMLElement)
			const thumbHorizontalWidth = this.getThumbHorizontalWidth()
			const thumbHorizontalX = scrollLeft / (scrollWidth - clientWidth) * (trackHorizontalWidth - thumbHorizontalWidth)
			const thumbHorizontalStyle = {
				width: thumbHorizontalWidth,
				transform: `translateX(${ thumbHorizontalX }px)`
			}
			const {scrollTop, clientHeight, scrollHeight} = position
			const trackVerticalHeight = getInnerHeight(this.trackVertical as HTMLElement)
			const thumbVerticalHeight = this.getThumbVerticalHeight()
			const thumbVerticalY = scrollTop / (scrollHeight - clientHeight) * (trackVerticalHeight - thumbVerticalHeight)
			const thumbVerticalStyle = {
				height: thumbVerticalHeight,
				transform: `translateY(${ thumbVerticalY }px)`
			}
			if (hideTracksWhenNotNeeded) {
				const trackHorizontalStyle = {
					visibility: scrollWidth > clientWidth ? "visible" : "hidden"
				}
				const trackVerticalStyle = {
					visibility: scrollHeight > clientHeight ? "visible" : "hidden"
				}
				this.trackHorizontal && css(this.trackHorizontal, trackHorizontalStyle)
				this.trackVertical && css(this.trackVertical, trackVerticalStyle)
			}
			this.thumbHorizontal && css(this.thumbHorizontal, thumbHorizontalStyle)
			this.thumbVertical && css(this.thumbVertical, thumbVerticalStyle)
		}
		if (onUpdate) onUpdate(position)
		if (typeof callback !== "function") return
		callback(position)
	}
	
	render() {
		const scrollbarWidth = getScrollbarWidth()
		const {
			onScroll,
			onScrollFrame,
			onScrollStart,
			onScrollStop,
			onUpdate,
			renderView = renderViewDefault,
			renderTrackHorizontal = renderTrackHorizontalDefault,
			renderTrackVertical = renderTrackVerticalDefault,
			renderThumbHorizontal = renderThumbHorizontalDefault,
			renderThumbVertical = renderThumbVerticalDefault,
			tagName = "div",
			hideTracksWhenNotNeeded,
			autoHide,
			autoHideTimeout,
			autoHideDuration,
			thumbSize,
			thumbMinSize,
			universal,
			autoHeight,
			autoHeightMin = 0,
			autoHeightMax = 200,
			style,
			children,
			...props
		} = this.props
		
		const {didMountUniversal} = this.state
		
		const containerStyle = {
			...containerStyleDefault,
			...(autoHeight && {
				...containerStyleAutoHeight,
				minHeight: autoHeightMin,
				maxHeight: autoHeightMax
			}),
			...style
		}
		
		const viewStyle = {
			...viewStyleDefault,
			// Hide scrollbars by setting a negative margin
			marginRight: scrollbarWidth ? -scrollbarWidth : 0,
			marginBottom: scrollbarWidth ? -scrollbarWidth : 0,
			...(autoHeight && {
				...viewStyleAutoHeight,
				// Add scrollbarWidth to autoHeight in order to compensate negative margins
				minHeight: isString(autoHeightMin)
					? `calc(${ autoHeightMin } + ${ scrollbarWidth }px)`
					: (autoHeightMin as number) + scrollbarWidth,
				maxHeight: isString(autoHeightMax)
					? `calc(${ autoHeightMax } + ${ scrollbarWidth }px)`
					: (autoHeightMax as number) + scrollbarWidth
			}),
			// Override min/max height for initial universal rendering
			...((autoHeight && universal && !didMountUniversal) && {
				minHeight: autoHeightMin,
				maxHeight: autoHeightMax
			}),
			// Override
			...((universal && !didMountUniversal) && viewStyleUniversalInitial)
		}
		
		const trackAutoHeightStyle = {
			transition: `opacity ${ autoHideDuration }ms`,
			opacity: 0
		}
		
		const trackHorizontalStyle = {
			...trackHorizontalStyleDefault,
			...(autoHide && trackAutoHeightStyle),
			...((!scrollbarWidth || (universal && !didMountUniversal)) && {
				display: "none"
			})
		}
		const trackVerticalStyle = {
			...trackVerticalStyleDefault,
			...(autoHide && trackAutoHeightStyle),
			...((!scrollbarWidth || (universal && !didMountUniversal)) && {
				display: "none"
			})
		}
		
		return createElement(tagName, {
			...props, key: "container", "data-id": "container", style: containerStyle, ref: (ref: HTMLElement) => {
				this.container = ref
			}
		}, [
			cloneElement(
				renderView({style: viewStyle}),
				{
					key: "view", "data-id": "view", ref: (ref: HTMLElement) => {
						this.view = ref
					}
				},
				children
			),
			cloneElement(
				renderTrackHorizontal({style: trackHorizontalStyle}),
				{
					key: "trackHorizontal", "data-id": "trackHorizontal", ref: (ref: HTMLElement) => {
						this.trackHorizontal = ref
					}
				},
				cloneElement(
					renderThumbHorizontal({style: thumbHorizontalStyleDefault}),
					{
						key: "thumbHorizontal", "data-id": "thumbHorizontal", ref: (ref: HTMLElement) => {
							this.thumbHorizontal = ref
						}
					}
				)
			),
			cloneElement(
				renderTrackVertical({style: trackVerticalStyle}),
				{
					key: "trackVertical", "data-id": "trackVertical", ref: (ref: HTMLElement) => {
						this.trackVertical = ref
					}
				},
				cloneElement(
					renderThumbVertical({style: thumbVerticalStyleDefault}),
					{
						key: "thumbVertical", "data-id": "thumbVertical", ref: (ref: HTMLElement) => {
							this.thumbVertical = ref
						}
					}
				)
			)
		])
	}
}

// Scrollbar.propTypes = {
// 	onScroll: PropTypes.func,
// 	onScrollFrame: PropTypes.func,
// 	onScrollStart: PropTypes.func,
// 	onScrollStop: PropTypes.func,
// 	onUpdate: PropTypes.func,
// 	renderView: PropTypes.func,
// 	renderTrackHorizontal: PropTypes.func,
// 	renderTrackVertical: PropTypes.func,
// 	renderThumbHorizontal: PropTypes.func,
// 	renderThumbVertical: PropTypes.func,
// 	tagName: PropTypes.string,
// 	thumbSize: PropTypes.number,
// 	thumbMinSize: PropTypes.number,
// 	hideTracksWhenNotNeeded: PropTypes.bool,
// 	autoHide: PropTypes.bool,
// 	autoHideTimeout: PropTypes.number,
// 	autoHideDuration: PropTypes.number,
// 	autoHeight: PropTypes.bool,
// 	autoHeightMin: PropTypes.oneOfType([
// 		PropTypes.number,
// 		PropTypes.string
// 	]),
// 	autoHeightMax: PropTypes.oneOfType([
// 		PropTypes.number,
// 		PropTypes.string
// 	]),
// 	universal: PropTypes.bool,
// 	style: PropTypes.object,
// 	children: PropTypes.node,
// }

Scrollbar.defaultProps = {
	renderView: renderViewDefault,
	renderTrackHorizontal: renderTrackHorizontalDefault,
	renderTrackVertical: renderTrackVerticalDefault,
	renderThumbHorizontal: renderThumbHorizontalDefault,
	renderThumbVertical: renderThumbVerticalDefault,
	tagName: "div",
	thumbMinSize: 30,
	hideTracksWhenNotNeeded: false,
	autoHide: false,
	autoHideTimeout: 1000,
	autoHideDuration: 200,
	autoHeight: false,
	autoHeightMin: 0,
	autoHeightMax: 200,
	universal: false,
}

