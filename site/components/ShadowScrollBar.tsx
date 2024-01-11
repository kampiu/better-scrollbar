import css from "dom-css"
import React, { Component, createRef } from "react"
import type { RefObject } from "react"
import ScrollBars from "../../src"
import type { ScrollbarProps, ScrollPosition } from "../../src"

interface ShadowScrollbarsProps extends ScrollbarProps {
	style?: React.CSSProperties
}

class ShadowScrollBar extends Component<ShadowScrollbarsProps> {
	
	shadowTop: RefObject<HTMLDivElement>
	shadowBottom: RefObject<HTMLDivElement>
	
	constructor(props: ShadowScrollbarsProps) {
		super(props)
		this.state = {
			scrollTop: 0,
			scrollHeight: 0,
			clientHeight: 0
		}
		this.handleUpdate = this.handleUpdate.bind(this)
		this.shadowTop = createRef()
		this.shadowBottom = createRef()
	}
	
	handleUpdate(position: ScrollPosition) {
		const {scrollTop, scrollHeight, clientHeight} = position
		const shadowTopOpacity = 1 / 20 * Math.min(scrollTop, 20)
		const bottomScrollTop = scrollHeight - clientHeight
		const shadowBottomOpacity = 1 / 20 * (bottomScrollTop - Math.max(scrollTop, bottomScrollTop - 20))
		if (this.shadowTop.current) {
			css(this.shadowTop.current, {opacity: shadowTopOpacity})
		}
		if (this.shadowBottom.current) {
			css(this.shadowBottom.current, {opacity: shadowBottomOpacity})
		}
	}
	
	render() {
		const {style, className, ...props} = this.props
		const containerStyle: React.CSSProperties = {
			...style,
			height: "100%",
			position: "relative"
		}
		const shadowTopStyle: React.CSSProperties = {
			position: "absolute",
			top: 0,
			left: 0,
			right: 0,
			height: 10,
			background: "linear-gradient(to bottom, rgba(0, 0, 0, 0.2) 2%, rgba(0, 0, 0, 0) 100%)"
		}
		const shadowBottomStyle: React.CSSProperties = {
			position: "absolute",
			bottom: 0,
			left: 0,
			right: 0,
			height: 10,
			background: "linear-gradient(to top, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0) 100%)"
		}
		return (
			<div style={ containerStyle } className={ className }>
				<ScrollBars
					ref="scrollbars"
					onUpdate={ this.handleUpdate }
					style={ {width: "100%", height: "100%"} }
					{ ...props }/>
				<div
					data-aa="aa"
					ref={this.shadowTop}
					style={ shadowTopStyle }/>
				<div
					ref={this.shadowBottom}
					style={ shadowBottomStyle }/>
			</div>
		)
	}
}

export default ShadowScrollBar
