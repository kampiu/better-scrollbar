const transformIgnorePatterns = [
	// Ignore modules without es dir.
	// Update: @babel/runtime should also be transformed
	`[/\\\\]node_modules[/\\\\](?!${ [].join("|") })[^/\\\\]+?[/\\\\](?!(es)[/\\\\])`,
	"/\\.(css|less)$/"
]

module.exports = {
	verbose: true,
	testEnvironment: "jsdom",
	setupFiles: [ "./test/setup.ts" ],
	setupFilesAfterEnv: [ "./test/setup.ts" ],
	testMatch: [
		"**/*.test.(ts|tsx)"
	],
	transform: {
		"^.+\\.(ts|tsx|js|jsx)$": "babel-jest",
		"\\.(less|css)$": "jest-less-loader" // 支持less
	},
	moduleNameMapper: {
		"/\\.(css|less)$/": "identity-obj-proxy",
	},
	moduleFileExtensions: [ "ts", "tsx", "js", "jsx", "json", "node" ],
	globals: {
		"ts-jest": {
			tsConfig: "./tsconfig.json",
		},
	},
	transformIgnorePatterns,
	testEnvironmentOptions: {
		url: "http://localhost",
	},
	preset: "jest-puppeteer",
	testTimeout: 20000,
}
