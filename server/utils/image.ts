import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import sharp from 'sharp';

sharp.cache(false);

function isMimetypeWithSizes(mimetype: string) {
	return mimetype.slice(0, 5) === 'image' && mimetype !== 'image/gif' && mimetype !== 'image/svg+xml';
}

export async function createImageSizes(
	path: string,
	mimetype: string,
): Promise<{ width?: number; height?: number }> {
	if (mimetype.slice(0, 5) !== 'image') {
		return {};
	}

	if (!existsSync(path)) {
		console.error(`could not create image sizes, file doesn't exist: "${path}"`);
		return {};
	}

	const image = sharp(path);
	const metadata = await image.metadata();

	if (mimetype === 'image/gif' || mimetype === 'image/svg+xml') {
		return { width: metadata.width, height: metadata.height };
	}

	let propertyToResize = 'width';
	if (metadata.width && metadata.height) {
		propertyToResize = metadata.width >= metadata.height ? 'width' : 'height';
	}

	const pathWithoutExtension = getPathWithoutExtension(path);
	await image.resize({ [propertyToResize]: 500, fit: 'inside' }).webp({ quality: 100 }).toFile(`${pathWithoutExtension}_500.webp`);
	await image.resize({ [propertyToResize]: 800, fit: 'inside' }).webp({ quality: 100 }).toFile(`${pathWithoutExtension}_800.webp`);
	await image.resize({ [propertyToResize]: 1040, fit: 'inside' }).webp({ quality: 100 }).toFile(`${pathWithoutExtension}_1040.webp`);
	await image.resize({ [propertyToResize]: 1280, fit: 'inside' }).webp({ quality: 100 }).toFile(`${pathWithoutExtension}_1280.webp`);

	return { width: metadata.width, height: metadata.height };
}

export async function renameFile(path: string, newPath: string, mimetype: string) {
	await fs.rename(path, newPath);
	if (!isMimetypeWithSizes(mimetype)) {
		return;
	}

	const pathWithoutExtension = getPathWithoutExtension(path);
	const newPathWithoutExtension = getPathWithoutExtension(newPath);
	existsSync(`${pathWithoutExtension}_500.webp`) && await fs.rename(`${pathWithoutExtension}_500.webp`, `${newPathWithoutExtension}_500.webp`);
	existsSync(`${pathWithoutExtension}_800.webp`) && await fs.rename(`${pathWithoutExtension}_800.webp`, `${newPathWithoutExtension}_800.webp`);
	existsSync(`${pathWithoutExtension}_1040.webp`) && await fs.rename(`${pathWithoutExtension}_1040.webp`, `${newPathWithoutExtension}_1040.webp`);
	existsSync(`${pathWithoutExtension}_1280.webp`) && await fs.rename(`${pathWithoutExtension}_1280.webp`, `${newPathWithoutExtension}_1280.webp`);
}

export async function deleteFile(path: string, mimetype: string) {
	existsSync(path) && await fs.rm(path);
	if (!isMimetypeWithSizes(mimetype)) {
		return;
	}

	const pathWithoutExtension = getPathWithoutExtension(path);
	existsSync(`${pathWithoutExtension}_500.webp`) && await fs.rm(`${pathWithoutExtension}_500.webp`);
	existsSync(`${pathWithoutExtension}_800.webp`) && await fs.rm(`${pathWithoutExtension}_800.webp`);
	existsSync(`${pathWithoutExtension}_1040.webp`) && await fs.rm(`${pathWithoutExtension}_1040.webp`);
	existsSync(`${pathWithoutExtension}_1280.webp`) && await fs.rm(`${pathWithoutExtension}_1280.webp`);
}

export async function imageWithSameNameExists(path: string, name: string, mimetype: string) {
	if (isMimetypeWithSizes(mimetype)) {
		name = `${getPathWithoutExtension(name)}.`;
	}
	const nameLength = name.length;

	if (!existsSync(path)) {
		return false;
	}

	const stats = await fs.lstat(path);
	if (!stats.isDirectory()) {
		return false;
	}

	const files = await fs.readdir(path, { withFileTypes: true });
	for (const file of files) {
		if (!file.isDirectory() && file.name.slice(0, nameLength) === name) {
			return true;
		}
	}

	return false;
}
