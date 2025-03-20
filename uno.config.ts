import {
	defineConfig,
	presetIcons,
	presetWind3,
	transformerDirectives,
	transformerVariantGroup,
} from 'unocss';

// TODO figure out separate stylesheets for admin & main page
// also maybe move all components' <style> to assets/[admin|page].css? maybe layouts?
// nuxt config unocss.mode
export default defineConfig({
	presets: [
		presetWind3(),
		presetIcons(),
	],
	transformers: [
		transformerDirectives(),
		transformerVariantGroup(),
	],
	shortcuts: [
		{
			'flex-center': 'flex justify-center items-center',
			'translate-center': 'translate-x--1/2 translate-y--1/2',
			'text-link': 'op-75 underline-humbak-5 underline-[0.1em] hoverable:(underline op-100)',
		},
		[/^hoverable[:-](.+)$/, ([, c]) => `hover:${c} focus-visible:${c}`],
		[/^neon[:-](.+)$/, ([, c]) => `border-2 border-${c} border-op-50 rounded-full bg-${c} bg-op-20 hoverable:(bg-op-30 border-op-100) dark:border-op-80 disabled:(border-op-30 bg-op-20 op-90 text-neutral-5) dark:disabled:(border-op-30 bg-op-20 text-neutral-4)`],
	],
	theme: {
		fontFamily: {
			sans: 'Atkinson Hyperlegible',
		},
		colors: {
			humbak: {
				DEFAULT: 'hsl(205, 100%, 70%)',
				1: 'hsl(205, 100%, 85%)',
				2: 'hsl(205, 100%, 80%)',
				3: 'hsl(205, 100%, 75%)',
				4: 'hsl(205, 100%, 70%)',
				5: 'hsl(205, 100%, 65%)',
				6: 'hsl(205, 100%, 59%)',
				7: 'hsl(205, 100%, 55%)',
				8: 'hsl(205, 100%, 52.5%)',
				9: 'hsl(205, 100%, 50%)',
			},
		},
		spacing: {
			container: 'clamp(0rem, 73rem + -80vw, 1rem)',
		},
	},
	blocklist: ['container'],
});
