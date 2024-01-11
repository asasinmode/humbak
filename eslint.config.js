import antfu from '@antfu/eslint-config';

export default await antfu({
	stylistic: {
		semi: true,
		indent: 'tab',
	},
	rules: {
		'curly': ['error', 'all'],
		'no-labels': 'off',
		'ts/consistent-type-definitions': ['error', 'type'],
		'style/brace-style': ['error', '1tbs'],
		'style/member-delimiter-style': ['error', {
			multiline: {
				delimiter: 'semi',
				requireLast: true,
			},
			singleline: {
				delimiter: 'semi',
				requireLast: true,
			},
		}],
		'style/comma-dangle': ['error', {
			arrays: 'always-multiline',
			objects: 'always-multiline',
			imports: 'always-multiline',
			exports: 'always-multiline',
			functions: 'never',
		}],
	},
	files: [
		'api/**/*',
		'admin/**/*',
		'admin/**/*.vue',
	],
	vue: true,
	typescript: true,
}, {
	files: ['api/**/*'],
	rules: {
		'no-console': 'off',
	},
}, {
	ignores: ['api/src/db/migrations/**/*'],
});
