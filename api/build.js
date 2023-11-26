import { writeFileSync } from 'node:fs';
import esbuild from 'esbuild';
import packageDocument from './package.json';

const internalDependenciesPatterns = [/~\/.*/, /@humbak\/.*/];

const external = Object.keys(packageDocument.dependencies).filter(dependency =>
	!internalDependenciesPatterns.some(pattern => pattern.test(dependency))
);

await esbuild.build({
	entryPoints: ['src/index.ts'],
	bundle: true,
	external,
	platform: 'node',
	outdir: 'dist',
	format: 'esm',
});

const dependencies = Object.keys(packageDocument.dependencies)
	.filter(key => !/@humbak\/.*/.test(key))
	.reduce((p, key) => ({
		...p,
		[key]: packageDocument.dependencies[key],
	}), {});

const content = {
	main: 'index.js',
	type: packageDocument.type,
	scripts: {
		start: 'node index.js',
	},
	dependencies,
};

writeFileSync('dist/package.json', JSON.stringify(content, null, 2));
