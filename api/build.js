import { writeFileSync } from 'fs';
import esbuild from 'esbuild';
import { dependencies as originalDependencies, type } from './package.json' assert { type: 'json' };

const internalDependenciesPatterns = [/@\/.*/, /@humbak\/.*/];

const external = Object.keys(originalDependencies).filter(dependency =>
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

const dependencies = Object.keys(originalDependencies)
	.filter(key => !/@humbak\/.*/.test(key))
	.reduce((p, key) => ({
		...p,
		[key]: originalDependencies[key],
	}), {});

const content = {
	type,
	main: 'index.js',
	scripts: {
		start: 'node index.js',
	},
	dependencies,
};

writeFileSync('dist/package.json', JSON.stringify(content, null, 2));
