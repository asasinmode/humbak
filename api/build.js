import { writeFileSync } from 'fs';
import esbuild from 'esbuild';
import thing from './package.json' assert { type: 'json' };

const internalDependenciesPatterns = [/@\/.*/, /@humbak\/.*/];

const external = Object.keys(thing.dependencies).filter(dependency =>
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

const { name, version, type } = thing;

const dependencies = Object.keys(thing.dependencies)
	.filter(key => !/@humbak\/.*/.test(key))
	.reduce((p, key) => ({
		...p,
		[key]: thing.dependencies[key],
	}), {});

const content = {
	name,
	type,
	version,
	main: 'index.js',
	scripts: {
		start: 'node index.js',
	},
	dependencies,
};

writeFileSync('dist/package.json', JSON.stringify(content, null, 2));
