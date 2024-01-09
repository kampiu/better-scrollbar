import React from "react"
import ReactDOM from "react-dom"
import App from "./App"
import "./styles/init.less"

function boostrap() {
	// @ts-ignore
	ReactDOM.render(<App/>, document.getElementById("root"))
}

boostrap()
