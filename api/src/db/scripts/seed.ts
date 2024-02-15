import { mkdir, writeFile } from 'node:fs/promises';
import { Buffer } from 'node:buffer';
import { db, pool } from '..';
import { promptProdContinue } from '../../helpers';
import { env } from '../../env';
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

await promptProdContinue();

await writeFile(`${stylesheetsStoragePath}/global.css`, `.text-slider {
	font-size: clamp(4rem, 1.3333rem + 13.3333vi, 12rem);
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
	},
];

const [{ insertId: slideInsertId }] = await db
	.insert(slides)
	.values(await Promise.all(slidesData.map(async ({ name, language, content, isHidden }) => {
		const { value } = await parsePageHtml(content);

		return {
			name,
			language,
			isHidden,
			rawContent: content,
			parsedContent: value,
		};
	})));

await db.insert(filesToSlides).values([
	{ slideId: slideInsertId, fileId: oceanSlideImageId },
	{ slideId: slideInsertId + 1, fileId: seaSlideImageId },
	{ slideId: slideInsertId + 2, fileId: lakeSlideImageId },
	{ slideId: slideInsertId + 3, fileId: riverSlideImageId },
]);

const enHomePageId = await createPage({
	language: 'en',
	title: 'home',
	slug: '',
	menuText: 'home EN',
	parentId: null,
	position: 0,
	content: `<section>
	<h1>humbak demo</h1>
	<p>This is a demo page for <strong>humbak</strong>, a blog cms. Current content is a showcase of the features available and should be reset regularly.</p>
</section>

<section>
	<h2>page</h2>
	<p>The content is displayed on the, well, <a href="#" class="text-link">page</a>. you are currently viewing.</p>

	<h2>api</h2>
	<p>The page and the admin communicate with and through the <a href="${env.API_URL}" target="_blank" class="text-link">api page</a>. Besides the <a href="${env.API_URL}" target="_blank" class="text-link">home page TODO fancy underline</a> (which I recommend you check out), there isn't much there.</p>

	<h2>admin</h2>
	<p>The content managment part of the <strong>humbak</strong> cms is done on the <a href="${env.ADMIN_URL}" target="_blank" class="text-link">admin page</a>. The following section describes the features available there and contains instructions on how to use them.</p>
</section>

<h2>features</h2>

<section>
	<h3>pages</h3>
	<p>The cms' main feature is creating pages, which can be done on the <a href="${env.ADMIN_URL}" target="_blank" class="text-link">admin home page</a>. Once there, you can browse and search all the pages and edit their <em>content</em>, <em>css</em> and <em>meta</em>.</p>

	<h4>pages table</h4>
	<p>At the top of the <a href="${env.ADMIN_URL}" target="_blank" class="text-link">home page</a> are a search input and a table. The table contains all the created pages and can be filtered using the input above it. Each page has <b>edit</b> and <b>delete</b> buttons.</p>
	<div class="flex-center" style="background-color: orange; height: 40px;">
		table placeholder
	</div>

	<h4>page form</h4>
	<p>Below the table there is a form consisting of 4 text fields, the <b>editor</b> and the <b>preview box</b>. Between the <em>editor</em> and the <em>preview box</em> are <b>control buttons</b>. Going from top to bottom, the <em>control buttons</em> are: <b>editor mode select</b>, <b>content formatting</b>, <b>snippets</b> and <b>Humbak Files</b>. The last, gray button in the middle can be used to resize the <em>editor</em>. Lastly, below the editor there are the <b>clear</b> and <b>save</b> buttons.</p>
	<div class="flex-center" style="background-color: orange; height: 40px;">
		form placeholder
	</div>
	<p>Use the <b>editor mode select</b> to switch between editing page's <em>html</em>, <em>css</em> and <em>meta</em>. Note that meta should be a valid JSON array containing objects that will be mapped to meta tags, for example <code>{ "name": "description", "content": "My page's description" }</code> will create a tag <code>&lt;meta name="description" content="My page's description"&gt;.</code></p>

	<h4>humbak files</h4>
	<p>The fourth <em>control button</em> button, opens the <b>humbak files dialog</b>, inside of which you can browse and search all of your files and open their preview or copy their html tag.</p>
	<div class="flex-center" style="background-color: orange; height: 40px;">
		humbak files dialog placeholder
	</div>
	<p><em>Humbak files</em> can be uploaded on the <a href="${env.ADMIN_URL}/files" target="_blank" class="text-link">files page</a> and have some special features that are described in the <a href="#files" class="text-link">humbak files</a> section. To make their features work, inside the page html you use them through a special tag <code>&ltHumbakFile fid="1"&gt;</code>. They require a special <b>fid</b> attribute that contains the target <b>humbak file's</b> id and accept all valid html attributes, such as <em>class</em> or <em>style</em>.</p>
	<div class="flex-center" style="background-color: orange; height: 40px;">
		humbak file tag placeholder
	</div>
</section>

<section>
	<h3>menu</h3>
	<p>After creating pages you can manage the menu layout on the <a href="${env.ADMIN_URL}/menu" target="_blank" class="text-link">admin menu page</a>.</p>
	<p class="indent">At the top there are: the <em>expandable and movable</em> <b>hidden pages list</b>, the <b>language select</b> and the <b>save button</b>. Below, there is the <b>menu layout editor</b> that is an interactive preview of the menu and can be used to hide and move the links around.</p>
	<div class="flex-center" style="background-color: orange; height: 40px;">
		menu page placeholder
	</div>

	<h4>example of using the menu layout editor</h4>
	<div class="flex-center" style="background-color: orange; height: 40px;">
		moving menus gif placeholder
	</div>
</section>

<section>
	<h3 id="files">files</h3>
	<p><b>Humbak files</b> can be uploaded and managed on the <a href="${env.ADMIN_URL}/files" target="_blank" class="text-link">admin files page</a>.</p>
	<p class="indent">
		In the top left corner you can find the <em>directory breadcrumbs</em> that show the current directory, the path to it and can be used to navigate directory structure. To the right of it, there are 2 buttons used to toggle between list and tile view, along with the save button.
	</p>
	<div class="flex-center" style="background-color: orange; height: 40px;">
		toggling views gif
	</div>
	<p class="indent">
		Below these are all of your files with the exception of the first item that's used to create new directories and upload new files. Besides editing files and directories' attributes you can navigate to directories or delete/move files and directories. The <b>move</b> button can either be dragged to the target directory or be clicked on to open the <b>move dialog</b>.
	</p>
	<div class="flex-center" style="background-color: orange; height: 40px;">
		moving files/directories gif
	</div>

	<h4>move dialog</h4>
	<p>The move dialog contains a list of directories. In case the directory you want to move a file/dir to is not in the same location you are currently in, you can use it to select a target dir and move a file there.</p>
	<div class="flex-center" style="background-color: orange; height: 40px;">
		moving dir using move dialog gif
	</div>
</section>

<section>
	<h3>global</h3>
	<p>While on the <a href="${env.ADMIN_URL}" target="_blank" class="text-link">admin home page</a> you can edit <em>css</em> and <em>meta</em> specific to each page, the <a href="${env.ADMIN_URL}/global" target="_blank" class="text-link">admin global page</a> is used to manage <em>css</em> and <em>meta</em> shared between all pages (with <em>meta</em> being language-specific).</p>
	<p class="indent">
		At the top you can select the <b>editor's</b> mode, choosing between <em>css</em> and <em>meta</em>, along with, in case of being in <em>meta</em> edit mode, choosing the target language. To the right of these selects are the <b>content formatting</b> and the <b>save</b> buttons. Below them is the <b>editor</b>.
	</p>
	<div class="flex-center" style="background-color: orange; height: 40px;">
		global page placeholder
	</div>
</section>

<section>
	<h3>slider</h3>
	<p>The <b>slider</b> seen at the top of all of your pages can be configured on the <a href="${env.ADMIN_URL}/slider" target="_blank" class="text-link">admin slider page</a>.</p>
	<p class="indent">
		The first row on the page contains the <b>language select</b>, the <b>slide select</b>, in order, <b>humbak files</b>, <b>slider settings</b> and <b>content formatting</b> control buttons and the <b>clear</b> and <b>save</b> buttons. Below these is the <b>editor</b>, under which is a form for managing the current slide's attributes: name, language and visibility.
	</p>
	<div class="flex-center" style="background-color: orange; height: 40px;">
		slider page placeholder
	</div>
	<p>Under the form are the <b>preview box</b>, showing the preview of currently edited slide, and a copy of the <b>slider</b> seen on the <a href="${env.PAGE_URL}" target="_blank" class="text-link">page</a>. Note that while the <em>preview box</em> updates in real time with current slide's <em>html</em>, the <em>slider</em> updates only after saving current changes.</p>
	<div class="flex-center" style="background-color: orange; height: 40px;">
		slider page previes placeholder
	</div>

	<h4>slider settings</h4>
	<p>The <em>slider settings</em> control button opens the <b>slider configuration dialog</b>. Inside it, you can adjust the slider's <b>aspect ratio</b>. Note that it should be in a format that's supported by the <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/calc" target="_blank" class="text-link">css calc function</a>.</p>
	<div class="flex-center" style="background-color: orange; height: 40px;">
		slider settings dialog placeholder
	</div>
</section>

<section>
	<h3>footer</h3>
	<p>Similarly to the <b>slider</b>, the <b>footer</b> can be edited on the <a href="${env.ADMIN_URL}/footer" target="_blank" class="text-link">admin footer page</a>.</p>
	<p class="indent">
		At the top are the <b>language select</b> and the <b>save</b> button, below which you can find an interactive preview of the footer. In the first column you can add and edit <em>emails</em>, in the second <em>phone numbers</em> and in the last the <em>location link</em>. Below these columns, in the second row, are social links that can be edited in the <b>social dialog</b>.
	</p>
	<div class="flex-center" style="background-color: orange; height: 40px;">
		footer page placeholder
	</div>

	<h4>socials dialog</h4>
	<p>Inside of the dialog you can add and edit a select few social links that will show up at the bottom of the footer.</p>
	<div class="flex-center" style="background-color: orange; height: 40px;">
		footer page socials dialog
	</div>
</section>

<section>
	<h3>settings</h3>
	<p>Lastly, on the <a href="${env.ADMIN_URL}/settings" target="_blank" class="text-link">admin settings page</a> you can log out and change your admin's account name and password.</p>
	<div class="flex-center" style="background-color: orange; height: 40px;">
		settings page placeholder
	</div>
</section>`,
});

await db.insert(footerContents).values({
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
