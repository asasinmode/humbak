import { mkdir, writeFile } from 'node:fs/promises';
import { Buffer } from 'node:buffer';
import { db, pool } from '..';
import { promptProdContinue } from '../../helpers';
import { hashPassword } from '../../helpers/auth';
import { filesStoragePath, stylesheetsStoragePath } from '../../helpers/files';
import { createImageSizes } from '../../helpers/files/image';
import { pages } from '../schema/pages';
import { slides } from '../schema/slides';
import { contents } from '../schema/contents';
import { menuLinks } from '../schema/menuLinks';
import { slideAspectRatio } from '../schema/slideAspectRatio';
import { directories } from '../schema/directories';
import { footerContents } from '../schema/footerContents';
import { files } from '../schema/files';
import { users } from '../schema/users';

await promptProdContinue();

await writeFile(`${stylesheetsStoragePath}/global.css`, `.text-slider {
	font-size: clamp(3rem, -0.7895rem + 18.9474vi, 12rem);
	font-weight: 600;
}`);

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

const oceanSlideImageId = await createFile({
	url: 'https://images.unsplash.com/photo-1488278905738-514111aa236c',
	directoryId: oceansDirId,
	name: 'ocean.jpg',
	path: '/oceans/ocean.jpg',
	title: 'ocean',
	alt: 'an ocean under a clouded sky',
	mimetype: 'image/jpeg',
});
const seaSlideImageId = await createFile({
	url: 'https://images.unsplash.com/photo-1444260239795-df1f0772a252',
	directoryId: seasDirId,
	name: 'sea.jpg',
	path: '/seas/sea.jpg',
	title: 'sea',
	alt: 'aerial photo of a see with a rocky coast',
	mimetype: 'image/jpeg',
});
const lakeSlideImageId = await createFile({
	url: 'https://images.unsplash.com/photo-1516132006923-6cf348e5dee2',
	directoryId: lakesDirId,
	name: 'lake.jpg',
	path: '/lakes/lake.jpg',
	title: 'lake',
	alt: 'a lake surrounded by a forest and mountains',
	mimetype: 'image/jpeg',
});

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

const [slideAspectRatioResult] = await db.select({ value: slideAspectRatio.value }).from(slideAspectRatio);
!slideAspectRatioResult && await db.insert(slideAspectRatio).values({ value: '1 / 3' });

const slidesData = [
	{
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
	},
	{
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
	},
	{
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
	},
	{
		name: 'river',
		language: 'en',
		content: `<div class="flex-center w-full h-full relative">
	<HumbakFile fid="${riverSlideImageId}" class="w-full h-full"></HumbakFile>
	<h6 class="absolute text-slider w-full h-full flex-center" style="color: white; background-color: hsl(0 0% 0% / 0.2)">
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
	},
];

await db.insert(slides).values(slidesData.map(({ name, language, content, isHidden }) => ({
	name,
	language,
	isHidden,
	rawContent: content,
	parsedContent: content,
})));

for (const { pageData, text, parentId, position } of [
	{
		id: 1,
		pageData: { language: 'en', title: 'Home', slug: '' },
		text: 'Home',
		parentId: null,
		position: 0,
	},
	{
		id: 2,
		pageData: { language: 'en', title: 'Kursy Nurkowania', slug: 'kursy-nurkowania' },
		text: 'Kursy',
		parentId: null,
		position: 0,
	},
	{
		id: 3,
		pageData: { language: 'en', title: 'Sekcje Nurkowe', slug: 'sekcje-nurkowe' },
		text: 'Sekcje nurkowe',
		parentId: 2,
		position: 0,
	},
]) {
	const [{ insertId: pageId }] = await db
		.insert(pages)
		.values(pageData);

	await Promise.all([
		db.insert(menuLinks).values({ text, pageId, position, parentId }),
		db.insert(contents).values({ pageId }),
		writeFile(`${stylesheetsStoragePath}/${pageId}.css`, ''),
	]);
}

await db.insert(footerContents).values({
	language: 'en',
	emails: ['email@example.com'],
	phoneNumbers: ['Person 123 456 789'],
	location: { text: 'Where to find us', value: 'https://google.com/maps' },
	socials: [{ type: 'twitter', value: 'https://x.com' }, { type: 'youtube', value: 'https://youtube.com' }],
});

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
