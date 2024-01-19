import DemoB from "./DemoB"
import { MockData, randomString } from "./mock"
import { useCallback } from "react"
import { useImmer } from "use-immer"

export default () => {
	
	const [scrollData, setScrollData] = useImmer(MockData)
	
	const onCreateItem = useCallback(() => {
		setScrollData(preScrollData => {
			Array.from({length: 1}, (_i, j) => {
				preScrollData.push({
					id: randomString(8),
					sort: preScrollData.length + j
				})
			})
		})
	}, [])
	
	return (
		<div>
			<DemoB
				onScrollEnd={() => console.log("结束滚动")}
				onScrollStart={() => console.log("开始滚动")}
			>
				{
					scrollData.map((item, index) => {
						return (
							<div key={ item.id } className="item" style={ {height: index % 2 ? 30 : 60} }>
								{ item.sort }
							</div>
						)
					})
				}
			</DemoB>
		</div>
	)
}
