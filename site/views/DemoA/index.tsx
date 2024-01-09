import React from "react"
import ScrollBars from "ScrollBar"

function Index() {
	
	// const list = useMemo(() => {
	// 	return Array.from({length: 100}, (v, i) => i)
	// }, [])
	
	return (
		<div style={ {width: 300, height: 300} }>
			<ScrollBars
				autoHeight
				autoHeightMax={ 100 }>
				<div style={ {width: "100%", height: 50} }/>
			</ScrollBars>
		</div>
	)
}

export default Index
