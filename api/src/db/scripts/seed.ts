import { mkdir, writeFile } from 'node:fs/promises';
import { Buffer } from 'node:buffer';
import { db, pool } from '..';
import { promptProdContinue } from '../../helpers';
import { hashPassword } from '../../helpers/auth';
import { filesStoragePath, stylesheetsStoragePath } from '../../helpers/files';
import { createImageSizes } from '../../helpers/files/image';
import { parsePageHtml } from '../../helpers/pages';
import { pages } from '../schema/pages';
import { slides } from '../schema/slides';
import { contents } from '../schema/contents';
import { menuLinks } from '../schema/menuLinks';
import { slideAspectRatio } from '../schema/slideAspectRatio';
import { directories } from '../schema/directories';
import { footerContents } from '../schema/footerContents';
import { files } from '../schema/files';
import { users } from '../schema/users';
import { filesToSlides } from '../schema/filesToSlides';
import { filesToPages } from '../schema/filesToPages';
import { enHomePageContent, enOceansPageContent, plHomePageContent, plOceansPageContent } from './helpers';

await promptProdContinue();

await writeFile(`${stylesheetsStoragePath}/global.css`, `.text-slider {
	font-size: clamp(4rem, 1.3333rem + 13.3333vi, 12rem);
	font-weight: 600;
}`);

// START
// slide images
// START
const riverSlideImageId = await createFile({
	url: 'https://images.unsplash.com/photo-1455577380025-4321f1e1dca7',
	directoryId: null,
	name: 'river.jpg',
	path: '/river.jpg',
	title: 'river',
	alt: 'a river surrounded by a forest',
	mimetype: 'image/jpeg',
});

await mkdir(`${filesStoragePath}/oceans`);
const [{ insertId: oceansDirId }] = await db.insert(directories).values({
	name: 'oceans',
	path: '/oceans',
});
await mkdir(`${filesStoragePath}/seas`);
const [{ insertId: seasDirId }] = await db.insert(directories).values({
	name: 'seas',
	path: '/seas',
});
await mkdir(`${filesStoragePath}/lakes`);
const [{ insertId: lakesDirId }] = await db.insert(directories).values({
	name: 'lakes',
	path: '/lakes',
});

const [oceanSlideImageId, seaSlideImageId, lakeSlideImageId] = await Promise.all([
	createFile({
		url: 'https://images.unsplash.com/photo-1488278905738-514111aa236c',
		directoryId: oceansDirId,
		name: 'ocean.jpg',
		path: '/oceans/ocean.jpg',
		title: 'ocean',
		alt: 'an ocean under a clouded sky',
		mimetype: 'image/jpeg',
	}),
	createFile({
		url: 'https://images.unsplash.com/photo-1444260239795-df1f0772a252',
		directoryId: seasDirId,
		name: 'sea.jpg',
		path: '/seas/sea.jpg',
		title: 'sea',
		alt: 'aerial photo of a see with a rocky coast',
		mimetype: 'image/jpeg',
	}),
	createFile({
		url: 'https://images.unsplash.com/photo-1516132006923-6cf348e5dee2',
		directoryId: lakesDirId,
		name: 'lake.jpg',
		path: '/lakes/lake.jpg',
		title: 'lake',
		alt: 'a lake surrounded by a forest and mountains',
		mimetype: 'image/jpeg',
	}),
]);
// END
// slide images
// END

// START
// misc files
// START
await mkdir(`${filesStoragePath}/other`);
const [{ insertId: otherDirId }] = await db.insert(directories).values({
	name: 'other',
	path: '/other',
});
await writeFile(`${filesStoragePath}/other/exampleTxt.txt`, 'not actually empty O.o');
await db.insert(files).values({
	directoryId: otherDirId,
	name: 'exampleTxt.txt',
	path: '/other/exampleTxt.txt',
	title: 'example txt',
	alt: 'an example txt maybe empty txt file',
	mimetype: 'text/plain',
});

await mkdir(`${filesStoragePath}/other/documents`);
const [{ insertId: documentsDirId }] = await db.insert(directories).values({
	name: 'documents',
	path: '/other/documents',
	parentId: otherDirId,
});
await writeFile(
	`${filesStoragePath}/other/documents/examplePdf.pdf`,
	await fetch('https://www.africau.edu/images/default/sample.pdf').then(r => r.arrayBuffer()).then(v => Buffer.from(v))
);
await db.insert(files).values({
	directoryId: documentsDirId,
	name: 'examplePdf.pdf',
	path: '/other/documents/examplePdf.pdf',
	title: 'example pdf',
	alt: 'an example pdf with unimportant content',
	mimetype: 'application/pdf',
});
// END
// misc files
// END

// START
// slides
// START
const [slideAspectRatioResult] = await db.select({ value: slideAspectRatio.value }).from(slideAspectRatio);
!slideAspectRatioResult && await db.insert(slideAspectRatio).values({ value: '1 / 3' });

const [{ insertId: slideInsertId }] = await db.insert(slides).values(await Promise.all([
	createSlide({
		name: 'ocean',
		language: 'en',
		content: `<div class="flex-center w-full h-full relative">
	<HumbakFile fid="${oceanSlideImageId}" class="w-full h-full"></HumbakFile>
	<h6 class="absolute w-full h-full flex-center text-slider" style="color: white; background-color: hsl(0 0 0% / 0.2)">
		ocean
	</h6>
	<a
		href="https://unsplash.com/photos/landscape-photography-of-waves-and-clouds-q-DJ9XhKkhA"
		target="_blank"
		class="absolute text-link"
		style="bottom: 0.3rem; right: 0.5rem;"
	>
		unsplash
	</a>
</div>`,
	}),
	createSlide({
		name: 'sea',
		language: 'en',
		content: `<div class="flex-center w-full h-full relative">
	<HumbakFile fid="${seaSlideImageId}" class="w-full h-full"></HumbakFile>
	<h6 class="absolute w-full h-full flex-center text-slider" style="color: white; background-color: hsl(0 0 0% / 0.2)">
		sea
	</h6>
	<a
		href="https://unsplash.com/photos/aerial-photo-body-of-water-cuTk59eNHUE"
		target="_blank"
		class="absolute text-link"
		style="bottom: 0.3rem; right: 0.5rem;"
	>
		unsplash
	</a>
</div>`,
	}),
	createSlide({
		name: 'lake',
		language: 'en',
		content: `<div class="flex-center w-full h-full relative">
	<HumbakFile fid="${lakeSlideImageId}" class="w-full h-full"></HumbakFile>
	<h6 class="absolute w-full h-full flex-center text-slider" style="color: white; background-color: hsl(0 0 0% / 0.2)">
		lake
	</h6>
	<a
		href="https://unsplash.com/photos/green-forest-near-lake-and-mountain-under-cloudy-sky-Hrmayke-v8g"
		target="_blank"
		class="absolute text-link"
		style="bottom: 0.3rem; right: 0.5rem;"
	>
		unsplash
	</a>
</div>`,
	}),
	createSlide({
		name: 'river',
		language: 'en',
		content: `<div class="flex-center w-full h-full relative">
	<HumbakFile fid="${riverSlideImageId}" class="w-full h-full"></HumbakFile>
	<h6 class="absolute text-slider w-full h-full flex-center" style="color: white;">
		river
	</h6>
	<h6 class="absolute text-slider" style="color: #00ff00; transform: translate(2px, 2px); mix-blend-mode: difference;">
		river
	</h6>
	<h6 class="absolute text-slider" style="color: #ff00ff; transform: translate(-2px, -2px); mix-blend-mode: difference;">
		river
	</h6>
	<a
		href="https://unsplash.com/photos/body-of-water-between-trees-under-cloudy-sky-rB7-LCa_diU"
		target="_blank"
		class="absolute text-link"
		style="bottom: 0.3rem; right: 0.5rem;"
	>
		unsplash
	</a>
</div>`,
		isHidden: true,
	}),
	createSlide({
		name: 'ocean',
		language: 'pl',
		content: `<div class="flex-center w-full h-full relative">
	<HumbakFile fid="${oceanSlideImageId}" class="w-full h-full"></HumbakFile>
	<h6 class="absolute w-full h-full flex-center text-slider" style="color: white; background-color: hsl(0 0 0% / 0.2)">
		ocean
	</h6>
	<a
		href="https://unsplash.com/photos/landscape-photography-of-waves-and-clouds-q-DJ9XhKkhA"
		target="_blank"
		class="absolute text-link"
		style="bottom: 0.3rem; right: 0.5rem;"
	>
		unsplash
	</a>
</div>`,
	}),
	createSlide({
		name: 'morze',
		language: 'pl',
		content: `<div class="flex-center w-full h-full relative">
	<HumbakFile fid="${seaSlideImageId}" class="w-full h-full"></HumbakFile>
	<h6 class="absolute w-full h-full flex-center text-slider" style="color: white; background-color: hsl(0 0 0% / 0.2)">
		morze
	</h6>
	<a
		href="https://unsplash.com/photos/aerial-photo-body-of-water-cuTk59eNHUE"
		target="_blank"
		class="absolute text-link"
		style="bottom: 0.3rem; right: 0.5rem;"
	>
		unsplash
	</a>
</div>`,
	}),
	createSlide({
		name: 'jezioro',
		language: 'pl',
		content: `<div class="flex-center w-full h-full relative">
	<HumbakFile fid="${lakeSlideImageId}" class="w-full h-full"></HumbakFile>
	<h6 class="absolute w-full h-full flex-center text-slider" style="color: white; background-color: hsl(0 0 0% / 0.2)">
		jezioro
	</h6>
	<a
		href="https://unsplash.com/photos/green-forest-near-lake-and-mountain-under-cloudy-sky-Hrmayke-v8g"
		target="_blank"
		class="absolute text-link"
		style="bottom: 0.3rem; right: 0.5rem;"
	>
		unsplash
	</a>
</div>`,
	}),
	createSlide({
		name: 'rzeka',
		language: 'pl',
		content: `<div class="flex-center w-full h-full relative">
	<HumbakFile fid="${riverSlideImageId}" class="w-full h-full"></HumbakFile>
	<h6 class="absolute text-slider w-full h-full flex-center" style="color: white;">
		rzeka
	</h6>
	<h6 class="absolute text-slider" style="color: #00ff00; transform: translate(2px, 2px); mix-blend-mode: difference;">
		rzeka
	</h6>
	<h6 class="absolute text-slider" style="color: #ff00ff; transform: translate(-2px, -2px); mix-blend-mode: difference;">
		rzeka
	</h6>
	<a
		href="https://unsplash.com/photos/body-of-water-between-trees-under-cloudy-sky-rB7-LCa_diU"
		target="_blank"
		class="absolute text-link"
		style="bottom: 0.3rem; right: 0.5rem;"
	>
		unsplash
	</a>
</div>`,
		isHidden: true,
	}),
]));

await db.insert(filesToSlides).values([
	{ slideId: slideInsertId, fileId: oceanSlideImageId },
	{ slideId: slideInsertId + 1, fileId: seaSlideImageId },
	{ slideId: slideInsertId + 2, fileId: lakeSlideImageId },
	{ slideId: slideInsertId + 3, fileId: riverSlideImageId },
	{ slideId: slideInsertId + 4, fileId: oceanSlideImageId },
	{ slideId: slideInsertId + 5, fileId: seaSlideImageId },
	{ slideId: slideInsertId + 6, fileId: lakeSlideImageId },
	{ slideId: slideInsertId + 7, fileId: riverSlideImageId },
]);
// END
// slides
// END

// START
// home
// START
const enHomePageId = await createPage({
	language: 'en',
	title: 'home',
	slug: '',
	menuText: 'home EN',
	parentId: null,
	position: 0,
	content: enHomePageContent,
});

const plHomePageId = await createPage({
	language: 'pl',
	title: 'dom',
	slug: '',
	menuText: 'home PL',
	parentId: null,
	position: 0,
	content: plHomePageContent,
});
// END
// home
// END

// START
// oceans home
// START
const [oceanPageImage1Id, oceanPageImage2Id, oceanPageImage3Id, oceanPageImage4Id] = await Promise.all([
	createFile({
		url: 'https://images.unsplash.com/photo-1471922694854-ff1b63b20054',
		directoryId: oceansDirId,
		name: 'ocean-sunrise-birds.jpg',
		path: '/oceans/ocean-sunrise-birds.jpg',
		title: 'ocean at sunrise',
		alt: 'an ocean at sunrise with birds flying above it',
		mimetype: 'image/jpeg',
	}),
	createFile({
		url: 'https://images.unsplash.com/photo-1508439192733-e7448b721adc',
		directoryId: oceansDirId,
		name: 'ocean-fog.jpg',
		path: '/oceans/ocean-fog.jpg',
		title: 'ocean fog',
		alt: 'an ocean with fog in the distance',
		mimetype: 'image/jpeg',
	}),
	createFile({
		url: 'https://images.unsplash.com/photo-1533371452382-d45a9da51ad9',
		directoryId: oceansDirId,
		name: 'ocean-sunset.jpg',
		path: '/oceans/ocean-sunset.jpg',
		title: 'ocean at sunset',
		alt: 'an ocean at sunset with clouded sky in the distance',
		mimetype: 'image/jpeg',
	}),
	createFile({
		url: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7',
		directoryId: oceansDirId,
		name: 'ocean-underwater.jpg',
		path: '/oceans/ocean-underwater.jpg',
		title: 'ocean underwater',
		alt: 'an underwater reef picture rife with fish',
		mimetype: 'image/jpeg',
	}),
]);

const enOceansPageId = await createPage({
	language: 'en',
	title: 'oceans',
	slug: 'oceans',
	menuText: 'oceans',
	parentId: null,
	position: 0,
	content: enOceansPageContent([oceanPageImage1Id, oceanPageImage2Id, oceanPageImage3Id, oceanPageImage4Id]),
});
const plOceansPageId = await createPage({
	language: 'pl',
	title: 'oceany',
	slug: 'oceany',
	menuText: 'oceany',
	parentId: null,
	position: 0,
	content: plOceansPageContent([oceanPageImage1Id, oceanPageImage2Id, oceanPageImage3Id, oceanPageImage4Id]),
});
await db.insert(filesToPages).values([
	{ pageId: enOceansPageId, fileId: oceanPageImage1Id },
	{ pageId: enOceansPageId, fileId: oceanPageImage2Id },
	{ pageId: enOceansPageId, fileId: oceanPageImage3Id },
	{ pageId: enOceansPageId, fileId: oceanPageImage4Id },
	{ pageId: plOceansPageId, fileId: oceanPageImage1Id },
	{ pageId: plOceansPageId, fileId: oceanPageImage2Id },
	{ pageId: plOceansPageId, fileId: oceanPageImage3Id },
	{ pageId: plOceansPageId, fileId: oceanPageImage4Id },
]);
// END
// oceans home
// END

// START
// footer
// START
await db.insert(footerContents).values([
	{
		language: 'en',
		emails: ['email@example.com'],
		phoneNumbers: ['Person 123 456 789'],
		location: { text: 'Where to find us', value: 'https://google.com/maps' },
		socials: [
			{ type: 'twitter', value: 'https://x.com' },
			{ type: 'facebook', value: 'https://facebook.com' },
			{ type: 'youtube', value: 'https://youtube.com' },
			{ type: 'instagram', value: 'https://instagram.com' },
		],
	},
	{
		language: 'pl',
		emails: ['email@example.com'],
		phoneNumbers: ['Osoba 123 456 789'],
		location: { text: 'Gdzie nas znaleźć', value: 'https://google.com/maps' },
		socials: [
			{ type: 'twitter', value: 'https://x.com' },
			{ type: 'facebook', value: 'https://facebook.com' },
			{ type: 'youtube', value: 'https://youtube.com' },
			{ type: 'instagram', value: 'https://instagram.com' },
		],
	},
]);
// END
// footer
// END

await db.insert(users).values({
	id: 'test',
	username: 'test',
	password: await hashPassword('test'),
});

await pool.end();

async function createFile(
	{ url, name, directoryId, path, title, alt, mimetype }:
	{ url: string; name: string; directoryId: number | null; path: string; title: string; alt: string; mimetype: string; }
) {
	await writeFile(
	`${filesStoragePath}${path}`,
	await fetch(`${url}?q=80&w=1920`).then(r => r.arrayBuffer()).then(v => Buffer.from(v))
	);
	const { width, height } = await createImageSizes(`${filesStoragePath}${path}`, mimetype);
	const [{ insertId }] = await db.insert(files).values({
		directoryId,
		name,
		path,
		title,
		alt,
		mimetype,
		width,
		height,
	});

	return insertId;
}

async function createPage({ language, title, slug, menuText, parentId, position, content }: {
	language: string;
	title: string;
	slug: string;
	menuText: string;
	parentId: number | null;
	position: number;
	content: string;
}) {
	const [{ insertId: pageId }] = await db
		.insert(pages)
		.values({ language, title, slug });

	const { value } = await parsePageHtml(content);

	await Promise.all([
		db.insert(menuLinks).values({ text: menuText, pageId, position, parentId }),
		db.insert(contents).values({ pageId, rawHtml: content, parsedHtml: value }),
		writeFile(`${stylesheetsStoragePath}/${pageId}.css`, ''),
	]);

	return pageId;
}

async function createSlide({ name, language, content, isHidden }: { name: string; language: string; content: string; isHidden?: boolean; }) {
	const { value } = await parsePageHtml(content);

	return {
		name,
		language,
		isHidden,
		rawContent: content,
		parsedContent: value,
	};
}
