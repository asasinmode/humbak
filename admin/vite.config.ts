import path from 'path';
import { defineConfig } from 'vite';
import Vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import AutoImport from 'unplugin-auto-import/vite';
import Unocss from 'unocss/vite';

export default defineConfig({
	resolve: {
		alias: {
			'~/': `${path.resolve(__dirname, 'src')}/`,
		},
	},
	plugins: [
		Vue({
			script: {
				defineModel: true,
			},
		}),
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
});
