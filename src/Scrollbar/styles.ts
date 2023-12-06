import { CSSProperties } from "react"

type Style = CSSProperties & { [P in keyof CSSStyleDeclaration]?: string | number }

export const containerStyleDefault: Style = {
	position: "relative",
	overflow: "hidden",
	width: "100%",
	height: "100%",
}

// Overrides containerStyleDefault properties
export const containerStyleAutoHeight: Style = {
	height: "auto"
}

export const viewStyleDefault: Style = {
	position: "absolute",
	top: 0,
	left: 0,
	right: 0,
	bottom: 0,
	overflow: "scroll",
	WebkitOverflowScrolling: "touch"
}

// Overrides viewStyleDefault properties
export const viewStyleAutoHeight: Style = {
	position: "relative",
	top: undefined,
	left: undefined,
	right: undefined,
	bottom: undefined
}

export const viewStyleUniversalInitial: Style = {
	overflow: "hidden",
	marginRight: 0,
	marginBottom: 0,
}

export const trackHorizontalStyleDefault: Style = {
	position: "absolute",
	height: 6
}

export const trackVerticalStyleDefault: Style = {
	position: "absolute",
	width: 6
}

export const thumbHorizontalStyleDefault: Style = {
	position: "relative",
	display: "block",
	height: "100%"
}

export const thumbVerticalStyleDefault: Style = {
	position: "relative",
	display: "block",
	width: "100%"
}

export const disableSelectStyle: Style = {
	userSelect: "none"
}

export const disableSelectStyleReset: Style = {
	userSelect: "unset"
}
