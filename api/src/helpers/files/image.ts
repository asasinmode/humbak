import { existsSync } from 'node:fs';
import { rename, rm } from 'node:fs/promises';
import sharp from 'sharp';

sharp.cache(false);

// dont create sizes for svg & update preview on frontend
// validation if file image check name without extension for images & tests
// change bad meta value toast to "incorrect"
// add veditor errors (meta incorrect json)
// humbak image on frontend replace use absolute path to page
// add default language on page, language select use it or first
// footer location inputs add placeholders Where to find us / https://google.com/maps
// files not image span extension if no mimetype
// store file view preference in localstorage
// page language change menulink move to hidden & reset position
// create page default menu link hidden
// images title & alt per language (separate table)
// page use global meta
export async function createImageSizes(
	path: string,
	mimetype: string
): Promise<{ width?: number; height?: number; }> {
	if (mimetype.slice(0, 5) !== 'image' || mimetype === 'image/gif') {
		return {};
	}

	if (!existsSync(path)) {
		console.error(`could not create image sizes, file doesn't exist: "${path}"`);
		return {};
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

	return { width: metadata.width, height: metadata.height };
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

export function getPathWithoutExtension(path: string) {
	const pathDotIndex = path.lastIndexOf('.');
	return path.slice(0, pathDotIndex !== -1 ? pathDotIndex : undefined);
}
