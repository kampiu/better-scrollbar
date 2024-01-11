declare module "*.less" {
	const content: {
		[className: string]: string
	}
	export = content
	export default content
}
