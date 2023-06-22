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
				sans: 'Roboto',
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
		[/^neon-button[:-](.+)$/, ([, c]) => `border-2 border-${c} border-op-50 rounded-full bg-${c} bg-op-20 hoverable:(bg-op-30 border-op-100) dark:border-op-80`],
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
});
