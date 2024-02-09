import type { IDialogFile } from './useApi';
import { env } from '~/env';
import { getPathWithoutExtension } from '~/helpers';

const { toast, toastGenericError } = useToast();
const api = useApi();

type ITempFileElement = {
	fid?: number;
	placeholder: HTMLElement;
	attributes: NamedNodeMap;
};

let loadedFiles: Record<number, IDialogFile> = {};

export function useHumbakFiles() {
	const parser = new DOMParser();
	const parsedContent = ref('');
	let fetchImagesTimeout: NodeJS.Timeout | undefined;

	const loadingIndicatorContainer = document.createElement('div');
	loadingIndicatorContainer.className = 'flex-center animate-duration-4500 text-black bg-black/10 min-h-[4rem] m-1';
	loadingIndicatorContainer.setAttribute('aria-hidden', 'true');
	const loadingIndicator = document.createElement('div');
	loadingIndicator.className = 'hourglass-loader after:block after:rounded-full after:content-empty';
	loadingIndicator.style.setProperty('--size', '20px');
	loadingIndicatorContainer.appendChild(loadingIndicator);

	function updateParsedContent(content: string) {
		fetchImagesTimeout && clearTimeout(fetchImagesTimeout);

		let dom: Document;
		try {
			dom = parser.parseFromString(content, 'text/html');
		} catch (e) {
			toastGenericError();
			throw e;
		}

		parsedContent.value = dom.body.innerHTML;

		const imageElements = dom.querySelectorAll('HumbakFile');
		if (!imageElements.length) {
			return;
		}

		const tempFiles: ITempFileElement[] = [];
		for (const element of imageElements) {
			const rawFid = element.attributes.getNamedItem('fid');
			let fid: number | undefined;
			if (rawFid !== null) {
				fid = Number.parseInt(rawFid.value);
				if (loadedFiles[fid]) {
					replaceTempWithImage({
						fid,
						attributes: element.attributes,
						placeholder: element as HTMLElement,
					}, loadedFiles[fid]);
					continue;
				}
			}

			const loadingCopy = loadingIndicatorContainer.cloneNode(true) as HTMLElement;
			element.replaceWith(loadingCopy);
			tempFiles.push({
				fid,
				placeholder: loadingCopy,
				attributes: element.attributes,
			});
		}

		parsedContent.value = dom.body.innerHTML;
		fetchImagesTimeout = setTimeout(() => fetchAndReplaceImages(dom, tempFiles), 1000);
	}

	async function fetchAndReplaceImages(dom: Document, tempFiles: ITempFileElement[]) {
		const ids: number[] = [];
		const placeholdersAndIds: { id: number; tempFile: ITempFileElement; }[] = [];

		for (const tempFile of tempFiles) {
			if (tempFile.fid === undefined) {
				placeholderError('HumbakFile nie ma ustawionego "fid"', tempFile.placeholder);
				continue;
			}
			if (Number.isNaN(tempFile.fid)) {
				placeholderError('HumbakFile fid musi być liczbą', tempFile.placeholder);
				continue;
			}
			if (!ids.includes(tempFile.fid)) {
				ids.push(tempFile.fid);
			}
			placeholdersAndIds.push({ id: tempFile.fid, tempFile });
		}

		if (!ids.length) {
			parsedContent.value = dom.body.innerHTML;
			return;
		}

		try {
			const files = await api.files.byIds.$get({ query: {
				ids: JSON.stringify(ids),
			} }).then(r => r.json());
			for (const file of files) {
				loadedFiles[file.id] = file;
			}
		} catch (e) {
			toast('błąd przy ładowaniu obrazów', 'error');
			console.error(e);
			return;
		}

		for (const { id, tempFile } of placeholdersAndIds) {
			const file = loadedFiles[id];
			if (!file) {
				placeholderError(`plik id "${id}" nieznaleziony w bazie danych`, tempFile.placeholder);
				continue;
			}
			replaceTempWithImage(tempFile, file);
		}

		parsedContent.value = dom.body.innerHTML;
	}

	function replaceTempWithImage(temp: ITempFileElement, file: IDialogFile) {
		const element = document.createElement('img');
		const src = `${env.VITE_PAGE_URL}/files${file.path}`;
		element.src = src;
		element.title = file.title;
		element.alt = file.alt;

		if (file.width !== null) {
			element.width = file.width;
		}
		if (file.height !== null) {
			element.height = file.height;
		}

		if (file.mimetype !== 'image/gif' && file.mimetype !== 'image/svg+xml') {
			const pathWithoutExtension = getPathWithoutExtension(src);
			element.srcset = `${pathWithoutExtension}_500.webp 500w, ${pathWithoutExtension}_800.webp 800w, ${pathWithoutExtension}_1040.webp 1040w, ${pathWithoutExtension}_1280.webp 1280w`;
			element.sizes = '(max-width: 480px) 500px, (max-width: 768px) 800px, (max-width: 960px) 1040px, 1280px';
		}

		for (const attribute of temp.attributes) {
			if (attribute.name !== 'fid') {
				element.setAttribute(attribute.name, attribute.value);
			}
		}
		temp.placeholder.replaceWith(element);
	}

	function placeholderError(message: string, replaceTarget: HTMLElement) {
		toast(message, 'warning');

		const element = document.createElement('p');
		element.textContent = message;
		element.className = 'text-red-6 font-600 border-2 border-red-5 border-dashed flex-center p-1 m-1 bg-red/10';

		replaceTarget.replaceWith(element);
	}

	return {
		parsedContent,
		updateParsedContent,
		clearLoadedFiles() {
			loadedFiles = {};
		},
	};
}
