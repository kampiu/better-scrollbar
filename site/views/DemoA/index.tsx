import React, { useMemo } from "react"
import ScrollBars from "ScrollBar"
import styles from "./index.module.less"

function Index() {
	
	const list = useMemo(() => {
		return Array.from({length: 100}, (v, i) => i)
	}, [])
	
	return (
		<div className={styles.container}>
			<ScrollBars
				autoHeight
				autoHeightMax={ 500 }
			>
				{
					list.map(item => (
						<div key={item} className={styles.item}>{item}</div>
					))
				}
			
			</ScrollBars>
		</div>
	)
}

export default Index
