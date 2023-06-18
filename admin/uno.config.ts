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
			'text-link': 'op75 hoverable:(underline op100)',
			'translate-center': 'translate-x--1/2 translate-y--1/2',
		},
		[/^hoverable[:-](.+)$/, ([, c]) => `hover:${c} focus-visible:${c}`],
		[/^neon-button[:-](.+)$/, ([, c]) => `border-2 border-${c} border-op-50 rounded-full bg-${c} bg-op-20 hover:bg-op-30 hover:border-op-100 focus-visible:bg-op-30 focus-visible:border-op-100 dark:border-op-80`],
	],
	rules: [
		[/^grid-area-(.+)$/, ([, c]) => ({ 'grid-area': c })],
	],
});
