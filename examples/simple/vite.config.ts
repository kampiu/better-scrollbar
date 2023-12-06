import react from "@vitejs/plugin-react"
import { join, resolve } from "path"
import type { UserConfig } from "vite"
import { defineConfig, normalizePath } from "vite"



// const manualChunk

/**
 * vite配置
 * https://vitejs.dev/config
 */
export default defineConfig((): UserConfig => {
	return {
		server: {
			port: 3000,
			cors: true,
		},
		resolve: {
			alias: [
				{
					find: "@",
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
