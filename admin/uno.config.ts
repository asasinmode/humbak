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
			'text-link': 'op-75 underline-humbak-5 underline-[0.1em] hoverable:(underline op-100)',
		},
		[/^neon[:-](.+)$/, ([, c]) => `border-2 border-${c} border-op-50 rounded-full bg-${c} bg-op-20 hoverable:(bg-op-30 border-op-100) dark:border-op-80 disabled:(border-op-30 bg-op-20 op-90 text-neutral-5) dark:disabled:(border-op-30 bg-op-20 text-neutral-4)`],
	],
	rules: [
		[/^grid-area-(.+)$/, ([, c]) => ({ 'grid-area': c })],
		[/^visually-hidden$/, () => ({
			'position': 'absolute',
			'overflow': 'hidden',
			'clip': 'rect(0 0 0 0)',
			'clip-path': 'inset(50%)',
			'width': '1px',
			'height': '1px',
			'white-space': 'nowrap',
		})],
		[/^undo-visually-hidden$/, () => ({
			'clip': 'unset',
			'clip-path': 'unset',
			'width': 'auto',
			'height': 'auto',
			'white-space': 'normal',
		})],
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
		spacing: {
			container: 'clamp(0rem, 73rem + -80vw, 1rem)',
		},
	},
	blocklist: ['container'],
	safelist: ['text-link', 'my-4', 'block', 'object-cover'],
});
