import * as React from "react"

export interface ItemProps {
	children: React.ReactElement
	setRef: (element: HTMLElement) => void;
}

export function Item({setRef, children}: ItemProps) {
	const refFunc = React.useCallback((node: HTMLElement) => {
		setRef(node)
	}, [])
	
	return React.cloneElement(children, {
		ref: refFunc,
	})
}
