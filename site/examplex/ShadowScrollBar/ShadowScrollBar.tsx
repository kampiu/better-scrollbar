import React from "react"
import { VirtualScrollBar } from "../../../src"
import "./index.less"

const MockData = Array.from({length: 100000}, (_, i) => {
	return {
		id: "" + i,
		sort: i
	}
})

function ShadowScrollBar() {
	return (
		<div>
			<VirtualScrollBar width={ 500 } height={ 500 } className="aaa">
				{
					MockData.map(item => (
						<div key={ item.id } className="item">{ item.sort }</div>
					))
				}
			</VirtualScrollBar>
		</div>
	)
}

export default ShadowScrollBar
