import type { CheerioAPI, Element } from 'cheerio';
import { load } from 'cheerio';
import { inArray } from 'drizzle-orm';
import { db } from '../db';
import { files } from '../db/schema/files';
import { getPathWithoutExtension } from './files/image';

export async function parsePageHtml(html?: string): Promise<{ value?: string; fileIds: number[]; }> {
	if (html === undefined) {
		return { fileIds: [] };
	} else if (html === '') {
		return { value: '', fileIds: [] };
	}

	const dom = load(html, {}, false);
	const humbakElements = dom('HumbakFile');

	const allFileIds: number[] = [];
	const humbakFiles: { id: number; element: Element; }[] = [];

	for (const element of humbakElements) {
		const rawId = element.attribs.fid;
		if (!rawId) {
			replaceWithError('HumbakFile nie ma ustawionego "fid"', element, dom);
			continue;
		}

		const parsedId = Number.parseInt(rawId);
		if (Number.isNaN(parsedId)) {
			replaceWithError('HumbakFile fid musi być liczbą', element, dom);
			continue;
		}

		!allFileIds.includes(parsedId) && allFileIds.push(parsedId);
		humbakFiles.push({ id: parsedId, element });
	}

	const fileItems = allFileIds.length
		? await db.select({
			id: files.id,
			path: files.path,
			title: files.title,
			alt: files.alt,
			name: files.name,
			mimetype: files.mimetype,
		})
			.from(files)
			.where(inArray(files.id, allFileIds))
		: [];

	const filesById: Record<number, typeof fileItems[number]> = fileItems.reduce((p, c) => ({
		...p,
		[c.id]: c,
	}), {});
	const fileIds = new Set<number>();

	for (const { id, element } of humbakFiles) {
		const file = filesById[id];
		if (!file) {
			replaceWithError(`plik id "${id}" nieznaleziony w bazie danych`, element, dom);
			continue;
		}

		fileIds.add(id);

		const image = dom('<img>');
		image.attr('src', `files${file.path}`);
		image.attr('title', file.title);
		image.attr('alt', file.alt);

		if (file.mimetype !== 'image/gif') {
			const pathWithoutExtension = getPathWithoutExtension(`files${file.path}`);
			image.attr('srcset', `${pathWithoutExtension}_500.webp 500w, ${pathWithoutExtension}_800.webp 800w, ${pathWithoutExtension}_1000.webp 1000w`);
			image.attr('sizes', '(max-width: 500px) 500px, (max-width: 800px) 800px, 1000px');
		}

		for (const attribute of element.attributes) {
			if (attribute.name !== 'fid') {
				image.attr(attribute.name, attribute.value);
			}
		}
		dom(element).replaceWith(image);
	}

	return { value: dom.html(), fileIds: Array.from(fileIds) };
}

function replaceWithError(message: string, element: Element, dom: CheerioAPI) {
	const error = dom(`<p class="text-red-5 font-600 border-2 border-red-5 border-dashed flex-center p-1 m-1 bg-red/10">${message}</p>`);
	dom(element).replaceWith(error);
}
