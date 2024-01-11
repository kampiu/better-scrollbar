import React, { PropsWithChildren, useCallback, useLayoutEffect, useRef, useState } from "react"
import ScrollBars, { type ScrollbarProps } from "../../src"

const itemHeight = 40

function VirtualScrollBar({className, children, ...props}: PropsWithChildren<ScrollbarProps>) {
	
	const domRef = useRef<HTMLDivElement>({} as HTMLDivElement)
	
	const [itemIndex, setIndex] = useState<[number, number]>([0, 0])
	
	const render = useCallback((scrollTop = 0) => {
		// @ts-ignore
		const {height = 0} = domRef.current?.getBoundingClientRect?.() || {}
		
		const visibleItemCount = Math.ceil(height / itemHeight)
		const startIndex = Math.floor(scrollTop / itemHeight)
		const endIndex = startIndex + visibleItemCount
		
		setIndex([startIndex, endIndex])
	}, [])
	
	const onScrollFrame = useCallback((position) => {
		render(position.scrollTop)
	}, [])
	
	useLayoutEffect(() => {
		render()
	}, [children])
	
	return (
		<div className={ className } ref={ domRef } style={{height: "100%"}}>
			<ScrollBars
				style={ {height: "100%"} }
				onScrollFrame={ onScrollFrame }
				{ ...props }
			>
				<div style={ {height: React.Children.count(children) * itemHeight} }/>
				{
					React.Children.map(children as React.ReactChildren | React.ReactChildren[], (child: any, index) => {
						if (index >= itemIndex[0] && index <= itemIndex[1]) {
							return React.cloneElement(child, {
								style: {
									...(child?.props?.style || {}),
									transform: `translateY(${ index * itemHeight }px)`
								}
							})
						}
						return null
					})
				}
			</ScrollBars>
		</div>
	)
}

export default VirtualScrollBar
