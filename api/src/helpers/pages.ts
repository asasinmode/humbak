import type { CheerioAPI, Element } from 'cheerio';
import { load } from 'cheerio';
import { inArray } from 'drizzle-orm';
import { db } from '../db';
import { files } from '../db/schema/files';

export async function parsePageHtml(html?: string) {
	if (html === undefined) {
		return undefined;
	} else if (html === '') {
		return '';
	}

	const dom = load(html, {}, false);
	const humbakElements = dom('HumbakFile');

	const fileIds: number[] = [];
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

		!fileIds.includes(parsedId) && fileIds.push(parsedId);
		humbakFiles.push({ id: parsedId, element });
	}

	const fileItems = await db.select({
		id: files.id,
		path: files.path,
		title: files.title,
		alt: files.alt,
		name: files.name,
		mimetype: files.mimetype,
	})
		.from(files)
		.where(inArray(files.id, fileIds));

	const filesById: Record<number, typeof fileItems[number]> = fileItems.reduce((p, c) => ({
		...p,
		[c.id]: c,
	}), {});

	for (const { id, element } of humbakFiles) {
		const file = filesById[id];
		if (!file) {
			replaceWithError(`plik id "${id}" nieznaleziony w bazie danych`, element, dom);
			continue;
		}
	}

	console.log('set to', dom.html());

	return dom.html();
}

// 	for (const { id, tempFile } of placeholdersAndIds) {
// 		const file = loadedFiles[id];
// 		if (!file) {
// 			placeholderError(`plik id "${id}" nieznaleziony w bazie danych`, tempFile.placeholder);
// 			continue;
// 		}
// 		replaceTempWithImage(tempFile, file);
// 	}

// 	parsedContent.value = dom.body.innerHTML;
// }

// function replaceTempWithImage(temp: ITempFileElement, file: IDialogFile) {
// 	const imageElement = document.createElement('img');
// 	imageElement.src = `files${file.path}`;
// 	imageElement.title = file.title;
// 	imageElement.alt = file.alt;
// 	for (const attribute of temp.attributes) {
// 		imageElement.setAttribute(attribute.name, attribute.value);
// 	}.parseHTML()
// 	temp.placeholder.replaceWith(imageElement);
// }

function replaceWithError(message: string, element: Element, dom: CheerioAPI) {
	const error = dom(`<p class="text-red-5 font-600 border-2 border-red-5 border-dashed flex-center p-1 m-1 bg-red/10">${message}</p>`);
	dom(element).replaceWith(error);
}
