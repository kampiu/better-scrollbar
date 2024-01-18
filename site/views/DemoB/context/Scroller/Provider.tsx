import React, { memo, useMemo } from "react"
import type { PropsWithChildren } from "react"
import _ from "lodash"
import type { IScrollerStore } from "./types"
import { ScrollerContext } from "./Context"

interface ScrollProviderProps {
	scrollStore: IScrollerStore
}

const ScrollerProvider = memo(
	({ children, scrollStore }: PropsWithChildren<ScrollProviderProps>) => {
		const value = useMemo(() => ({ scrollStore }), [scrollStore])

		return <ScrollerContext.Provider value={value}>{children}</ScrollerContext.Provider>
	},
	(prev, next) => _.isEqual(prev, next),
)

export default ScrollerProvider
