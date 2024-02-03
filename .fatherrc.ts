import { defineConfig } from "father"

export default defineConfig({
	targets: {
		ie: 11
	},
	esm: {
		output: "es",
	},
	cjs: {
		output: "lib",
	},
	umd: {
		entry: {
			"src/styles/ScrollBar.less": {
				output: "dist",
				extractCSS: true,
				postcssOptions: {},
				autoprefixer: {
					supports: true
				}
			},
			"src/ScrollBar": {
				name: "",
				output: "dist",
				extractCSS: true,
				externals: {
					"react": "React",
					"react-dom": "ReactDOM"
				},
			},
		},
	},
	platform: "browser",
	sourcemap: true,
	extraBabelPlugins: [
		["jsx-remove-data-test-id", {"attributes": ["data-id"]}]
	],
})

