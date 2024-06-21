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
		'nuxt-gtag',
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
			watch: {
				ignored: ['./public/files/**', './public/stylesheets/**'],
			},
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
	gtag: {
		initCommands: [
			['consent', 'default', {
				ad_user_data: 'denied',
				ad_personalization: 'denied',
				ad_storage: 'denied',
				analytics_storage: 'denied',
				wait_for_update: 500,
			}],
		],
	},
});
