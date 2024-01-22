import React from "react"
import { VirtualScrollBar } from "../../../src"
import "./index.less"

let uuid = 0
function LargeScaleScroll() {
	return (
		<div>
			<VirtualScrollBar>
				{
					Array.from({length: 500}, () => {
						uuid++
						return {
							id: uuid
						}
					}).map(item => {
						return (
							<div key={item.id} className="grid-item">
								{item.id}
							</div>
						)
					})
				}
			</VirtualScrollBar>
		</div>
	)
}

export default LargeScaleScroll
