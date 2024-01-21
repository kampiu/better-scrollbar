import React, { useCallback, useState } from "react"
import { VirtualScrollBar } from "../../../src"
import "./index.less"
import { generateRandomInteger } from "./utils"

let uuid = 0
const MockData = Array.from({length: 5000}, (_) => {
	uuid++
	return {
		id: uuid,
		height: generateRandomInteger(30, 100)
	}
})

function RandomHeight() {
	
	const [scrollState, setScrollState] = useState({
		x: 0,
		y: 0,
		isScrolling: false,
		scrollHeight: 0,
		scrollWidth: 0,
		clientWidth: 0,
		clientHeight: 0
	})
	const [dataSource, setDataSource] = useState(MockData)
	
	const onRemove = useCallback((node) => {
		setDataSource(preState => {
			return preState.filter(item => item.id !== node.id)
		})
	}, [])
	
	const onInsertBefore = useCallback((index: number) => {
		setDataSource(preState => {
			uuid++
			preState.splice(Math.max(index, 0), 0, {
				id: uuid,
				height: generateRandomInteger(30, 100)
			})
			return [...preState]
		})
	}, [])
	
	const onInsertAfter = useCallback((index) => {
		setDataSource(preState => {
			uuid++
			preState.splice(index + 1, 0, {
				id: uuid,
				height: generateRandomInteger(30, 100)
			})
			return [...preState]
		})
	}, [])
	
	return (
		<div className="wrapper">
			<div className="list">
				<VirtualScrollBar
					onScroll={ setScrollState }
				>
					{
						dataSource.map((item, index) => (
							<div key={ item.id } className="item" style={ {height: item.height} }>
								No.{ item.id }
								<span>
								<div className="button error" onClick={ () => onRemove(item) }>Remove</div>
								<div className="button primary"
								     onClick={ () => onInsertBefore(index) }>Insert Before</div>
								<div className="button primary"
								     onClick={ () => onInsertAfter(index) }>Insert After</div>
							</span>
							</div>
						))
					}
				</VirtualScrollBar>
			</div>
			<div className="result">
				<div className="result-item">数据量 { dataSource.length } <span
					style={ {marginLeft: "auto"} }>{ scrollState.isScrolling ? "滚动中" : "停止滚动" }</span></div>
				<div className="result-item">滚动位置 <span>Y: { scrollState.y }</span>
					<span>X: { scrollState.x }</span></div>
				<div className="result-item">滚动内容大小 <span>Width: { scrollState.scrollWidth }</span>
					<span>Height: { scrollState.scrollHeight }</span></div>
				<div className="result-item">视区内容大小 <span>Width: { scrollState.clientWidth }</span>
					<span>Height: { scrollState.clientHeight }</span></div>
			</div>
		</div>
	)
}

export default RandomHeight
