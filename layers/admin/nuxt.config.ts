import path from 'node:path';
import url from 'node:url';

const dirname = path.dirname(url.fileURLToPath(import.meta.url));

export default defineNuxtConfig({
	compatibilityDate: '2025-02-01',
	future: {
		compatibilityVersion: 4,
	},
	experimental: {
		typedPages: true,
	},
	components: [
		{ path: path.join(dirname, './app/components'), prefix: 'Admin' },
	],
	app: {
		head: {
			script: [
				{ innerHTML: 'const prefersDark = window.matchMedia && window.matchMedia(\'(prefers-color-scheme: dark)\').matches; const setting = localStorage.getItem(\'color-scheme\') || \'auto\'; if (setting === \'dark\' || (prefersDark && setting !== \'light\')) { document.documentElement.classList.toggle(\'dark\', true); }' },
			],
		},
	},
	routeRules: {
		'/admin/**': { ssr: false },
	},
});
