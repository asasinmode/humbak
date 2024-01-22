export default defineNuxtConfig({
	devtools: { enabled: true },
	devServer: {
		port: 5174,
	},
	modules: [
		'@unocss/nuxt',
	],
	css: [
		'@unocss/reset/tailwind.css',
		'assets/index.css',
	],
	app: {
		head: {
			link: [{ rel: 'icon', href: '/favicon.ico' }],
			script: [{
				children: `const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
const setting = localStorage.getItem('color-scheme') || 'auto'
if (setting === 'dark' || (prefersDark && setting !== 'light'))
document.documentElement.classList.toggle('dark', true)`,
			}],
		},
	},
});
