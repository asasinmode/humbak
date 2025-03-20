// @ts-check
import antfu from '@antfu/eslint-config';
import unocss from '@unocss/eslint-config/flat';
import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt(
	antfu({
		stylistic: {
			semi: true,
			indent: 'tab',
		},
		rules: {
			'vue/return-in-computed-property': 'off',
			'style/brace-style': ['error', '1tbs'],
			'antfu/no-top-level-await': 'off',
			'curly': ['error', 'all'],
			'no-labels': 'off',
			// 'ts/no-unused-expressions': 'off',
		},
		formatters: true,
	}, {
		ignores: ['public/**/*'],
	}, {
		files: ['tests/**/*'],
		rules: {
			'no-console': 'off',
			'test/no-import-node-test': 'off',
		},
	}, unocss),
);
