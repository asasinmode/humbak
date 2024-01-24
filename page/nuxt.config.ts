import process from 'node:process';

export default defineNuxtConfig({
	devtools: { enabled: true },
	devServer: {
		port: Number.parseInt(process.env.PORT || '5174'),
	},
	modules: [
		'@unocss/nuxt',
	],
	css: [
		'@unocss/reset/tailwind.css',
		'assets/index.css',
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
			link: [{ rel: 'icon', href: '/favicon.ico' }],
		},
	},
	runtimeConfig: {
		public: {
			apiUrl: '',
			adminUrl: '',
		},
	},
});
