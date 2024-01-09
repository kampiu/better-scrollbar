import react from "@vitejs/plugin-react"
import { join } from "path"
import type { UserConfig } from "vite"
import { defineConfig } from "vite"



// const manualChunk

/**
 * vite配置
 * https://vitejs.dev/config
 */
export default defineConfig((): UserConfig => {
	return {
		base: "/better-scrollbar/",
		server: {
			port: 3000,
			cors: true,
		},
		resolve: {
			alias: [
				{
					find: "@",
					replacement: join(__dirname, "site"),
				},
				{
					find: "ScrollBar",
					replacement: join(__dirname, "src"),
				}
			],
		},
		plugins: [
			react(),
		],
		css: {
			modules: {
				localsConvention: "camelCaseOnly",
				generateScopedName: "[local]_[hash:base64:8]",
			},
			preprocessorOptions: {
				less: {
					javascriptEnabled: true,
				},
			},
		}
	}
})
