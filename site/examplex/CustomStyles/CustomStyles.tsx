import React, { useCallback, useState } from "react"
import type { HTMLProps, PropsWithChildren } from "react"
import { VirtualScrollBar } from "../../../src"
import "./index.less"

let uuid = 0
const dataSource = Array.from({length: 5000}, (_) => {
	uuid++
	return {
		id: uuid,
	}
})

function CustomStyles() {
	
	const [scrollState, setScrollState] = useState({
		x: 0, y: 0,
		scrollWidth: 0,
		clientWidth: 0,
		scrollHeight: 0,
		clientHeight: 0,
		isScrolling: false
	})
	
	const renderThumbVertical = useCallback((props?: PropsWithChildren<HTMLProps<HTMLDivElement>>): React.ReactElement => {
		const ptg = scrollState.y / (scrollState.scrollHeight - scrollState.clientHeight)
		const thumbStyle = {
			backgroundColor: `rgb(${ Math.round((ptg * 255)) }, ${ Math.round(ptg * 255) }, ${ Math.round(ptg * 255) })`
		}
		return (
			<div
				{ ...props }
				style={ {...props?.style, ...thumbStyle} }
			/>
		)
	}, [scrollState.y, scrollState.scrollHeight, scrollState.clientHeight])
	
	const renderView = useCallback((props?: PropsWithChildren<HTMLProps<HTMLDivElement>>): React.ReactElement => {
		const ptg = scrollState.y / (scrollState.scrollHeight - scrollState.clientHeight)
		const viewStyle = {
			color: `rgb(${ Math.round((ptg * 255)) }, ${ Math.round(ptg * 255) }, ${ Math.round(ptg * 255) })`,
			backgroundColor: `rgb(${ Math.round(255 - (ptg * 255)) }, ${ Math.round(255 - (ptg * 255)) }, ${ Math.round(255 - (ptg * 255)) })`
		}
		return (
			<div
				{ ...props }
				style={ {...props?.style, ...viewStyle} }
			/>
		)
	}, [scrollState.y, scrollState.scrollHeight, scrollState.clientHeight])
	
	return (
		<div className="custom-list">
			<VirtualScrollBar
				onScroll={ setScrollState }
				renderView={ renderView }
				renderThumbVertical={ renderThumbVertical }
			>
				{
					dataSource.map((item) => (
						<div key={ item.id } className="custom-item">
							No.{ item.id }
						</div>
					))
				}
			</VirtualScrollBar>
		</div>
	)
}

export default CustomStyles
