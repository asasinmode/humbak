export default defineNuxtConfig({
	compatibilityDate: '2025-02-01',
	devtools: { enabled: true },
	future: {
		compatibilityVersion: 4,
	},
	experimental: {
		typedPages: true,
	},
	eslint: {
		config: {
			standalone: false,
		},
	},
	typescript: {
		tsConfig: {
			compilerOptions: {
				target: 'ESNext',
			},
		},
	},
	nitro: {
		esbuild: {
			options: {
				target: 'esnext',
			},
		},
	},
	modules: [
		'@nuxt/eslint',
		'@nuxt/fonts',
		'@unocss/nuxt',
		'nuxt-gtag',
	],
	css: [
		'@unocss/reset/tailwind.css',
		'assets/index.css',
		'assets/humbakContent.css',
	],
	runtimeConfig: {
		databaseUrl: '',
		databaseName: '',
		filesPath: '',
		stylesheetsPath: '',
		public: {
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
	fonts: {
		defaults: {
			weights: [400, 700],
		},
	},
});
