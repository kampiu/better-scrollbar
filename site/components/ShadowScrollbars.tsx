import css from "dom-css"
import React, { Component } from "react"
import ScrollBars from "ScrollBar"
import type { ScrollbarProps, ScrollPosition } from "ScrollBar"

interface ShadowScrollbarsProps extends ScrollbarProps{
	style?: React.CSSProperties
}

class ShadowScrollbars extends Component<ShadowScrollbarsProps> {
	
	constructor(props: ShadowScrollbarsProps) {
		super(props)
		this.state = {
			scrollTop: 0,
			scrollHeight: 0,
			clientHeight: 0
		}
		this.handleUpdate = this.handleUpdate.bind(this)
	}
	
	handleUpdate(position: ScrollPosition) {
		const {shadowTop, shadowBottom} = this.refs
		const {scrollTop, scrollHeight, clientHeight} = position
		const shadowTopOpacity = 1 / 20 * Math.min(scrollTop, 20)
		const bottomScrollTop = scrollHeight - clientHeight
		const shadowBottomOpacity = 1 / 20 * (bottomScrollTop - Math.max(scrollTop, bottomScrollTop - 20))
		css(shadowTop, {opacity: shadowTopOpacity})
		css(shadowBottom, {opacity: shadowBottomOpacity})
	}
	
	render() {
		const {style, ...props} = this.props
		const containerStyle: React.CSSProperties = {
			...style,
			position: "relative"
		}
		const shadowTopStyle: React.CSSProperties = {
			position: "absolute",
			top: 0,
			left: 0,
			right: 0,
			height: 10,
			background: "linear-gradient(to bottom, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0) 100%)"
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
			<div style={ containerStyle }>
				<ScrollBars
					ref="scrollbars"
					onUpdate={ this.handleUpdate }
					{ ...props }/>
				<div
					data-aa="aa"
					ref="shadowTop"
					style={ shadowTopStyle }/>
				<div
					ref="shadowBottom"
					style={ shadowBottomStyle }/>
			</div>
		)
	}
}

export default ShadowScrollbars
