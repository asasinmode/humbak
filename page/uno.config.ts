import {
	defineConfig,
	presetIcons,
	presetUno,
	presetWebFonts,
	transformerDirectives,
	transformerVariantGroup,
} from 'unocss';

export default defineConfig({
	presets: [
		presetUno(),
		presetIcons(),
		presetWebFonts({
			provider: 'bunny',
			fonts: {
				sans: 'Atkinson Hyperlegible',
			},
		}),
	],
	transformers: [
		transformerDirectives(),
		transformerVariantGroup(),
	],
	shortcuts: [
		{
			'flex-center': 'flex justify-center items-center',
			'translate-center': 'translate-x--1/2 translate-y--1/2',
			'text-link': 'op-75 hoverable:(underline op-100)',
		},
	],
	rules: [
		[/^grid-area-(.+)$/, ([, c]) => ({ 'grid-area': c })],
	],
	variants: [
		(matcher) => {
			if (matcher.slice(0, 9) !== 'hoverable') {
				return matcher;
			}

			return {
				matcher: matcher.slice(10),
				selector: s => `${s}:hover, ${s}:focus-visible`,
			};
		},
	],
	theme: {
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
	},
	blocklist: ['container'],
});