import process from 'node:process';

export default defineNuxtConfig({
	devtools: { enabled: true },
	nitro: {
		output: {
			dir: './dist',
			serverDir: './dist/server',
			publicDir: './dist/public',
		},
	},
	devServer: {
		port: Number.parseInt(process.env.PORT || '5174'),
	},
	modules: [
		'@unocss/nuxt',
	],
	css: [
		'@unocss/reset/tailwind.css',
		'assets/index.css',
		'assets/content.css',
	],
	routeRules: {
		'/stylesheets/**': {
			headers: {
				'access-control-allow-origin': process.env.NUXT_PUBLIC_ADMIN_URL,
			},
		},
	},
	vite: {
		server: {
			cors: true,
		},
	},
	app: {
		head: {
			link: [
				{ rel: 'icon', href: '/favicon.ico' },
				{ rel: 'canonical', href: 'https://humbak.eu/' },
				{ rel: 'stylesheet', type: 'text/css', href: '/stylesheets/global.css' },
			],
		},
	},
	runtimeConfig: {
		public: {
			apiUrl: '',
			adminUrl: '',
			defaultLanguage: '',
		},
	},
});
