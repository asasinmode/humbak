import { URL, fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import Vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import AutoImport from 'unplugin-auto-import/vite';
import Unocss from 'unocss/vite';

export default defineConfig({
	define: {
		__VUE_OPTIONS_API__: false,
	},
	resolve: {
		alias: {
			'~': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
	plugins: [
		Vue(),
		Unocss(),
		Components({
			dts: './src/types/components.d.ts',
		}),
		AutoImport({
			imports: [
				'vue',
				'vue-router',
				{ vue: ['defineModel'] },
			],
			dts: './src/types/auto-imports.d.ts',
			dirs: [
				'./src/composables',
			],
			vueTemplate: true,
		}),
	],
	server: {
		watch: {
			ignored: '**/public/**',
		},
	},
});
