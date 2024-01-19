import { cloneElement, useCallback } from "react"
import type { ReactElement } from "react"

export interface ItemProps {
	children: ReactElement
	setRef: (element: HTMLElement) => void;
}

export function Item({setRef, children}: ItemProps) {
	const refFunc = useCallback((node: HTMLElement) => {
		setRef(node)
	}, [])
	
	return cloneElement(children, {
		ref: refFunc,
	})
}
