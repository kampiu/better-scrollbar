module.exports = {
	verbose: true,
	testEnvironment: "jsdom",
	setupFiles: ["./test/setup.ts"],
	setupFilesAfterEnv: ['./test/setupAfterEnv.ts'],
	testMatch: [
		"**/*.test.(ts|tsx)"
	],
	moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
	globals: {
		"ts-jest": {
			tsConfig: "./tsconfig.json",
		},
	},
	testEnvironmentOptions: {
		url: "http://localhost",
	},
}
