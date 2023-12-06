import type { DOMWindow } from "jsdom"

declare var window: Window;

declare const globalThis: {
	window: DOMWindow
}
