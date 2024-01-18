import React from 'react';
import ReactDOM from 'react-dom';

export function isDOM(node: any): node is HTMLElement | SVGElement {
	return node instanceof HTMLElement || node instanceof SVGElement;
}

/**
 * Return if a node is a DOM node. Else will return by `findDOMNode`
 */
export function findDOMNode<T = Element | Text>(
	node: React.ReactInstance | HTMLElement | SVGElement,
): T {
	if (isDOM(node)) {
		return (node as unknown) as T;
	}
	
	if (node instanceof React.Component) {
		return (ReactDOM.findDOMNode(node) as unknown) as T;
	}
	
	return null;
}

export type TimeoutID = {
	id: number
}

/** 当前时间 */
const now =
	typeof performance === "object" && typeof performance!.now === "function"
		? () => performance!.now()
		: () => Date.now()

/**
 * 取消截流器
 * @param timeoutID
 */
export function cancelTimeout(timeoutID: TimeoutID) {
	window.cancelAnimationFrame(timeoutID.id)
}

/**
 * 基于RAF创建截流器
 */
export function requestTimeout(callback: () => void, delay: number): TimeoutID {
	const start = now()
	
	const timeoutID = {
		id: window.requestAnimationFrame(function tick() {
			if (now() - start >= delay) {
				callback.call(null)
			} else {
				timeoutID.id = window.requestAnimationFrame(tick)
			}
		}),
	}
	
	return timeoutID
}
