import { existsSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import sharp from 'sharp';

export async function createImageSizes(path: string, mimetype: string) {
	if (mimetype.slice(0, 5) !== 'image') {
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

	const pathWithoutExtension = path.slice(0, path.lastIndexOf('.'));
	await image.resize({ [propertyToResize]: 500, fit: 'inside' }).jpeg().toFile(`${pathWithoutExtension}_500.jpeg`);
	await image.resize({ [propertyToResize]: 800, fit: 'inside' }).jpeg().toFile(`${pathWithoutExtension}_800.jpeg`);
	await image.resize({ [propertyToResize]: 1000, fit: 'inside' }).jpeg().toFile(`${pathWithoutExtension}_1000.jpeg`);
}

export async function deleteFile(path: string, mimetype: string) {
	existsSync(path) && await rm(path);
	if (mimetype.slice(0, 5) !== 'image') {
		return;
	}

	const pathWithoutExtension = path.slice(0, path.lastIndexOf('.'));
	existsSync(`${pathWithoutExtension}_500.jpeg`) && await rm(`${pathWithoutExtension}_500.jpeg`);
	existsSync(`${pathWithoutExtension}_800.jpeg`) && await rm(`${pathWithoutExtension}_800.jpeg`);
	existsSync(`${pathWithoutExtension}_1000.jpeg`) && await rm(`${pathWithoutExtension}_1000.jpeg`);
}
