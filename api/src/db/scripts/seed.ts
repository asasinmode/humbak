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

await writeFile(
	`${filesStoragePath}/slideImage.jpg`,
	await fetch('https://images.unsplash.com/photo-1455577380025-4321f1e1dca7?q=80&w=1920').then(r => r.arrayBuffer()).then(v => Buffer.from(v))
);
const { width, height } = await createImageSizes(`${filesStoragePath}/slideImage.jpg`, 'image/jpeg');
const [{ insertId: riverSlideImageId }] = await db.insert(files).values({
	directoryId: null,
	name: 'slideImage.jpg',
	path: '/slideImage.jpg',
	title: 'river in a forest',
	alt: 'a river surrounded by a forest',
	mimetype: 'image/jpeg',
	width,
	height,
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

await mkdir(`${filesStoragePath}/other`);
const [{ insertId: otherDirId }] = await db.insert(directories).values({
	name: 'other',
	path: '/other',
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
await writeFile(`${filesStoragePath}/other/exampleTxt.txt`, 'not actually empty O.o');
await db.insert(files).values({
	directoryId: otherDirId,
	name: 'exampleTxt.txt',
	path: '/other/exampleTxt.txt',
	title: 'example txt',
	alt: 'an example txt maybe empty txt file',
	mimetype: 'text/plain',
});

const [slideAspectRatioResult] = await db.select({ value: slideAspectRatio.value }).from(slideAspectRatio);
!slideAspectRatioResult && await db.insert(slideAspectRatio).values({ value: '1 / 3' });

const slidesData = [
	{
		name: 'ocean',
		language: 'en',
		content: `<div class="flex-center w-full h-full" style="background-color: hsla(0, 100%, 50%, 0.3)">
<h6>1</h6>
</div>`,
	},
	{
		name: 'sea',
		language: 'en',
		content: `<div class="flex-center w-full h-full" style="background-color: hsla(0, 100%, 50%, 0.3)">
<h6>1</h6>
</div>`,
	},
	{
		name: 'lake',
		language: 'en',
		content: `<div class="flex-center w-full h-full" style="background-color: hsla(120, 100%, 50%, 0.3)">
<h6>2</h6>
</div>`,
	},
	{
		name: 'river',
		language: 'en',
		content: `<div class="flex-center w-full h-full" style="background-color: hsla(0, 0%, 50%, 0.3)">
	<h6 style="font-size: 3rem">Hidden River</h6>
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
