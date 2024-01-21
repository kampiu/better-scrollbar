import React from "react"
import DemoA from "./views/DemoA"
import styles from "./App.module.less"

function App() {
	return (
		<div className={styles.layout}>
			<DemoA />
		</div>
	)
}

export default App
