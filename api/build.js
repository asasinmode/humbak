import { writeFileSync } from 'fs';
import esbuild from 'esbuild';
import packageDocument from './package.json' assert { type: 'json' };

const internalDependenciesPatterns = [/@\/.*/, /@humbak\/.*/];

const external = Object.keys(packageDocument.dependencies).filter(dependency =>
	!internalDependenciesPatterns.some(pattern => pattern.test(dependency))
);

await esbuild.build({
	entryPoints: ['src/index.ts'],
	bundle: true,
	external,
	platform: 'node',
	outdir: 'dist',
});

const dependencies = Object.keys(packageDocument.dependencies)
	.filter(key => !/@humbak\/.*/.test(key))
	.reduce((p, key) => ({
		...p,
		[key]: packageDocument.dependencies[key],
	}), {});

const content = {
	main: 'index.js',
	scripts: {
		start: 'node index.js',
	},
	dependencies,
};

writeFileSync('dist/package.json', JSON.stringify(content, null, 2));
