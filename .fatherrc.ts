import { defineConfig } from "father"

export default defineConfig({
	esm: {
		output: "es",
	},
	cjs: {
		output: "lib",
	},
	umd: {
		output: "dist",
		externals: [],
		postcssOptions: {},
	},
	platform: "browser",
	sourcemap: true,
	extraBabelPlugins: [
		[ "jsx-remove-data-test-id", { "attributes": [ "data-id" ] } ]
	],
})

