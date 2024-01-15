import { existsSync } from 'node:fs';
import { rename, rm } from 'node:fs/promises';
import sharp from 'sharp';

sharp.cache(false);

export async function createImageSizes(path: string, mimetype: string) {
	if (mimetype.slice(0, 5) !== 'image' || mimetype === 'image/gif') {
		return;
	}

	if (!existsSync(path)) {
		console.error(`could not create image sizes, file doesn't exist: "${path}"`);
		return;
	}

	const image = sharp(path);
	const metadata = await image.metadata();

	let propertyToResize = 'width';
	if (metadata.width && metadata.height) {
		propertyToResize = metadata.width >= metadata.height ? 'width' : 'height';
	}

	const pathWithoutExtension = getPathWithoutExtension(path);
	await image.resize({ [propertyToResize]: 500, fit: 'inside' }).webp().toFile(`${pathWithoutExtension}_500.webp`);
	await image.resize({ [propertyToResize]: 800, fit: 'inside' }).webp().toFile(`${pathWithoutExtension}_800.webp`);
	await image.resize({ [propertyToResize]: 1000, fit: 'inside' }).webp().toFile(`${pathWithoutExtension}_1000.webp`);
}

export async function renameFile(path: string, newPath: string, mimetype: string) {
	await rename(path, newPath);
	if (mimetype.slice(0, 5) !== 'image' || mimetype === 'image/gif') {
		return;
	}

	const pathWithoutExtension = getPathWithoutExtension(path);
	const newPathWithoutExtension = getPathWithoutExtension(newPath);
	existsSync(`${pathWithoutExtension}_500.webp`) && await rename(`${pathWithoutExtension}_500.webp`, `${newPathWithoutExtension}_500.webp`);
	existsSync(`${pathWithoutExtension}_800.webp`) && await rename(`${pathWithoutExtension}_800.webp`, `${newPathWithoutExtension}_800.webp`);
	existsSync(`${pathWithoutExtension}_1000.webp`) && await rename(`${pathWithoutExtension}_1000.webp`, `${newPathWithoutExtension}_1000.webp`);
}

export async function deleteFile(path: string, mimetype: string) {
	existsSync(path) && await rm(path);
	if (mimetype.slice(0, 5) !== 'image' || mimetype === 'image/gif') {
		return;
	}

	const pathWithoutExtension = getPathWithoutExtension(path);
	existsSync(`${pathWithoutExtension}_500.webp`) && await rm(`${pathWithoutExtension}_500.webp`);
	existsSync(`${pathWithoutExtension}_800.webp`) && await rm(`${pathWithoutExtension}_800.webp`);
	existsSync(`${pathWithoutExtension}_1000.webp`) && await rm(`${pathWithoutExtension}_1000.webp`);
}

function getPathWithoutExtension(path: string) {
	const pathDotIndex = path.lastIndexOf('.');
	return path.slice(0, pathDotIndex !== -1 ? pathDotIndex : undefined);
}
