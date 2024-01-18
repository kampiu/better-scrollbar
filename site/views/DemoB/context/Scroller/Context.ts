import { createContext } from "react"
import type { IScrollerStore, ScrollContextProps } from "./types"

export const ScrollerStore: IScrollerStore = {
	x: 0,
	y: 0,
}

export const ScrollerContext = createContext<ScrollContextProps>({
	scrollStore: ScrollerStore,
})
