import { fileURLToPath, URL } from 'node:url';
import Vue from '@vitejs/plugin-vue';
import Unocss from 'unocss/vite';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { defineConfig } from 'vite';

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
