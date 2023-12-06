module.exports = {
	presets: [ "@babel/preset-react", "@babel/preset-typescript", [ "@babel/preset-env", { loose: true } ] ],
	plugins: [
		[ "jsx-remove-data-test-id", { "attributes": [ "data-testid" ] } ]
	]
}
