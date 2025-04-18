import { Buffer } from 'node:buffer';
import fs from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promptProdContinue } from '.';
import { hashPassword } from '../../utils/auth';
import { createImageSizes } from '../../utils/image';
import { parseHumbakHtml } from '../../utils/pages';
import {
	enAtlanticPageContent,
	enBaikalLakesPageContent,
	enBalticPageContent,
	enBlackPageContent,
	enCaspianLakesPageContent,
	enGreatLakesPageContent,
	enHomePageContent,
	enIndianPageContent,
	enLakesPageContent,
	enMediterraneanPageContent,
	enOceansPageContent,
	enPacificPageContent,
	enSeasPageContent,
	plAtlanticPageContent,
	plBaikalLakesPageContent,
	plBalticPageContent,
	plBlackPageContent,
	plCaspianLakesPageContent,
	plGreatLakesPageContent,
	plHomePageContent,
	plIndianPageContent,
	plLakesPageContent,
	plMediterraneanPageContent,
	plOceansPageContent,
	plPacificPageContent,
	plSeasPageContent,
} from './seedContents';

await promptProdContinue();

const currentDir = dirname(fileURLToPath(import.meta.url));

const {
	contents,
	directories,
	files,
	filesToPages,
	filesToSlides,
	footerContents,
	menuLinks,
	pages,
	slideAspectRatio,
	slides,
	users,
} = tables;

await fs.writeFile(`${stylesheetsStoragePath}/global.css`, `.text-slider {
	font-size: clamp(4rem, 1.3333rem + 13.3333vi, 12rem);
	font-weight: 700;
}

.my-4 {
	margin-block: 1rem;
}`);

console.time('seed');

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

await fs.mkdir(`${filesStoragePath}/oceans`);
const [{ insertId: oceansDirId }] = await db.insert(directories).values({
	name: 'oceans',
	path: '/oceans',
});
await fs.mkdir(`${filesStoragePath}/seas`);
const [{ insertId: seasDirId }] = await db.insert(directories).values({
	name: 'seas',
	path: '/seas',
});
await fs.mkdir(`${filesStoragePath}/lakes`);
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
console.timeLog('seed', 'slide images');
// END

// START
// misc files
// START
await fs.mkdir(`${filesStoragePath}/other`);
const [{ insertId: otherDirId }] = await db.insert(directories).values({
	name: 'other',
	path: '/other',
});
await fs.writeFile(`${filesStoragePath}/other/exampleTxt.txt`, 'not actually empty O.o');
await db.insert(files).values({
	directoryId: otherDirId,
	name: 'exampleTxt.txt',
	path: '/other/exampleTxt.txt',
	title: 'example txt',
	alt: 'an example txt maybe empty txt file',
	mimetype: 'text/plain',
});

await fs.mkdir(`${filesStoragePath}/other/documents`);
const [{ insertId: documentsDirId }] = await db.insert(directories).values({
	name: 'documents',
	path: '/other/documents',
	parentId: otherDirId,
});
await fs.writeFile(
	`${filesStoragePath}/other/documents/examplePdf.pdf`,
	await fetch('https://www.africau.edu/images/default/sample.pdf').then(r => r.arrayBuffer()).then(v => Buffer.from(v)),
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
console.timeLog('seed', 'misc files');
// END

// START
// slides
// START
const [slideAspectRatioResult] = await db.select({ value: slideAspectRatio.value }).from(slideAspectRatio);
!slideAspectRatioResult && await db.insert(slideAspectRatio).values({ value: '1 / 3' });

const [{ insertId: enSlideInsertId }] = await db.insert(slides).values(await Promise.all([
	createSlide({
		name: 'ocean',
		language: 'en',
		content: `<div class="flex-center size-full relative">
	<HumbakFile fid="${oceanSlideImageId}" class="size-full object-cover"></HumbakFile>
	<h6 class="absolute size-full flex-center text-slider" style="color: white; background-color: hsl(0 0 0% / 0.2)">
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
		content: `<div class="flex-center size-full relative">
	<HumbakFile fid="${seaSlideImageId}" class="size-full object-cover"></HumbakFile>
	<h6 class="absolute size-full flex-center text-slider" style="color: white; background-color: hsl(0 0 0% / 0.2)">
		sea
	</h6>
	<a
		href="https://unsplash.com/photos/aerial-photo-body-of-water-cuTk59eNHUE"
		target="_blank"
		class="absolute text-link"
		style="bottom: 0.3rem; right: 0.5rem; color: white;"
	>
		unsplash
	</a>
</div>`,
	}),
	createSlide({
		name: 'lake',
		language: 'en',
		content: `<div class="flex-center size-full relative">
	<HumbakFile fid="${lakeSlideImageId}" class="size-full object-cover"></HumbakFile>
	<h6 class="absolute size-full flex-center text-slider" style="color: white; background-color: hsl(0 0 0% / 0.2)">
		lake
	</h6>
	<a
		href="https://unsplash.com/photos/green-forest-near-lake-and-mountain-under-cloudy-sky-Hrmayke-v8g"
		target="_blank"
		class="absolute text-link"
		style="bottom: 0.3rem; right: 0.5rem; color: black; text-shadow: white 1px 1px 1px;"
	>
		unsplash
	</a>
</div>`,
	}),
	createSlide({
		name: 'river',
		language: 'en',
		content: `<div class="flex-center size-full relative">
	<HumbakFile fid="${riverSlideImageId}" class="size-full object-cover"></HumbakFile>
	<h6 class="absolute text-slider size-full flex-center" style="color: white;">
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
		style="bottom: 0.3rem; right: 0.5rem; color: black; text-shadow: white 1px 1px 1px;"
	>
		unsplash
	</a>
</div>`,
		isHidden: true,
	}),
]));

const [{ insertId: plSlideInsertId }] = await db.insert(slides).values(await Promise.all([
	createSlide({
		name: 'ocean',
		language: 'pl',
		content: `<div class="flex-center size-full relative">
	<HumbakFile fid="${oceanSlideImageId}" class="size-full object-cover"></HumbakFile>
	<h6 class="absolute size-full flex-center text-slider" style="color: white; background-color: hsl(0 0 0% / 0.2)">
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
		content: `<div class="flex-center size-full relative">
	<HumbakFile fid="${seaSlideImageId}" class="size-full object-cover"></HumbakFile>
	<h6 class="absolute size-full flex-center text-slider" style="color: white; background-color: hsl(0 0 0% / 0.2)">
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
		content: `<div class="flex-center size-full relative">
	<HumbakFile fid="${lakeSlideImageId}" class="size-full object-cover"></HumbakFile>
	<h6 class="absolute size-full flex-center text-slider" style="color: white; background-color: hsl(0 0 0% / 0.2)">
		jezioro
	</h6>
	<a
		href="https://unsplash.com/photos/green-forest-near-lake-and-mountain-under-cloudy-sky-Hrmayke-v8g"
		target="_blank"
		class="absolute text-link"
		style="bottom: 0.3rem; right: 0.5rem; color: black; text-shadow: white 1px 1px 1px;"
	>
		unsplash
	</a>
</div>`,
	}),
	createSlide({
		name: 'rzeka',
		language: 'pl',
		content: `<div class="flex-center size-full relative">
	<HumbakFile fid="${riverSlideImageId}" class="size-full object-cover"></HumbakFile>
	<h6 class="absolute text-slider size-full flex-center" style="color: white;">
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
		style="bottom: 0.3rem; right: 0.5rem; color: black; text-shadow: white 1px 1px 1px;"
	>
		unsplash
	</a>
</div>`,
		isHidden: true,
	}),
]));

await db.insert(filesToSlides).values([
	{ slideId: enSlideInsertId, fileId: oceanSlideImageId },
	{ slideId: enSlideInsertId + 1, fileId: seaSlideImageId },
	{ slideId: enSlideInsertId + 2, fileId: lakeSlideImageId },
	{ slideId: enSlideInsertId + 3, fileId: riverSlideImageId },
	{ slideId: plSlideInsertId, fileId: oceanSlideImageId },
	{ slideId: plSlideInsertId + 1, fileId: seaSlideImageId },
	{ slideId: plSlideInsertId + 2, fileId: lakeSlideImageId },
	{ slideId: plSlideInsertId + 3, fileId: riverSlideImageId },
]);
// END
// slides
console.timeLog('seed', 'slides');
// END

// START
// home
// START
await fs.mkdir(`${filesStoragePath}/home`);
const [{ insertId: homeDirId }] = await db.insert(directories).values({
	name: 'home',
	path: '/home',
	parentId: null,
});
await fs.mkdir(`${filesStoragePath}/home/pages-en`);
const [{ insertId: pagesEnDirId }] = await db.insert(directories).values({
	name: 'pages-en',
	path: '/home/pages-en',
	parentId: homeDirId,
});
const [
	pagesTableEnImgId,
	pagesFormEnImgId,
	pagesHumbakFilesEnImgId,
	pagesHumbakFileTagImgId,
] = await Promise.all([
	createFile(
		{
			url: './assets/pages-table-en.png',
			directoryId: pagesEnDirId,
			name: 'table.png',
			path: '/home/pages-en/table.png',
			title: 'pages table',
			alt: 'pages table on admin page',
			mimetype: 'image/png',
		},
		true,
	),
	createFile(
		{
			url: './assets/pages-form-en.png',
			directoryId: pagesEnDirId,
			name: 'form.png',
			path: '/home/pages-en/form.png',
			title: 'content form',
			alt: 'content form on admin page',
			mimetype: 'image/png',
		},
		true,
	),
	createFile(
		{
			url: './assets/pages-humbak-files-en.png',
			directoryId: pagesEnDirId,
			name: 'dialog.png',
			path: '/home/pages-en/dialog.png',
			title: 'humbak files dialog',
			alt: 'dialog with list of files',
			mimetype: 'image/png',
		},
		true,
	),
	createFile(
		{
			url: './assets/pages-humbak-file-tag.png',
			directoryId: homeDirId,
			name: 'pages-file-tag.png',
			path: '/home/pages-file-tag.png',
			title: 'pages humbak file tag',
			alt: 'content editor with a humbak file HTML tag and a preview next to it',
			mimetype: 'image/png',
		},
		true,
	),
]);

await fs.mkdir(`${filesStoragePath}/home/pages-pl`);
const [{ insertId: pagesPlDirId }] = await db.insert(directories).values({
	name: 'pages-pl',
	path: '/home/pages-pl',
	parentId: homeDirId,
});
const [
	pagesTablePlImgId,
	pagesFormPlImgId,
	pagesHumbakFilesPlImgId,
] = await Promise.all([
	createFile(
		{
			url: './assets/pages-table-pl.png',
			directoryId: pagesPlDirId,
			name: 'table.png',
			path: '/home/pages-pl/table.png',
			title: 'tabela stron',
			alt: 'tabela stron na stronie admina',
			mimetype: 'image/png',
		},
		true,
	),
	createFile(
		{
			url: './assets/pages-form-pl.png',
			directoryId: pagesPlDirId,
			name: 'form.png',
			path: '/home/pages-pl/form.png',
			title: 'formularz zawartości',
			alt: 'formularz zawartości na stronie admina',
			mimetype: 'image/png',
		},
		true,
	),
	createFile(
		{
			url: './assets/pages-humbak-files-pl.png',
			directoryId: pagesPlDirId,
			name: 'dialog.png',
			path: '/home/pages-pl/dialog.png',
			title: 'dialog humbak plików',
			alt: 'dialog z listą plików',
			mimetype: 'image/png',
		},
		true,
	),
]);

await fs.mkdir(`${filesStoragePath}/home/menu`);
const [{ insertId: menuDirId }] = await db.insert(directories).values({
	name: 'menu',
	path: '/home/menu',
	parentId: homeDirId,
});
const [
	menuOverviewEnImgId,
	menuOverviewPlImgId,
	menuMovingEnImgId,
	menuMovingPlImgId,
] = await Promise.all([
	createFile(
		{
			url: './assets/menu-en.png',
			directoryId: menuDirId,
			name: 'overview-en.png',
			path: '/home/menu/overview-en.png',
			title: 'menu page',
			alt: 'menu page with interactive preview for editing the layout',
			mimetype: 'image/png',
		},
		true,
	),
	createFile(
		{
			url: './assets/menu-pl.png',
			directoryId: menuDirId,
			name: 'overview-pl.png',
			path: '/home/menu/overview-pl.png',
			title: 'strona menu',
			alt: 'strona menu z interaktywnym podglądem do edytowania ułożenia',
			mimetype: 'image/png',
		},
		true,
	),
	createFile(
		{
			url: './assets/menu-en.gif',
			directoryId: menuDirId,
			name: 'using-en.gif',
			path: '/home/menu/using-en.gif',
			title: 'menu page',
			alt: 'menu page moving items using the interactive preview',
			mimetype: 'image/gif',
		},
		true,
	),
	createFile(
		{
			url: './assets/menu-pl.gif',
			directoryId: menuDirId,
			name: 'using-pl.gif',
			path: '/home/menu/using-pl.gif',
			title: 'strona menu',
			alt: 'strona menu przesuwanie linków przy użyciu interaktywnego podglądu',
			mimetype: 'image/gif',
		},
		true,
	),
]);

await fs.mkdir(`${filesStoragePath}/home/files-en`);
const [{ insertId: filesEnDirId }] = await db.insert(directories).values({
	name: 'files-en',
	path: '/home/files-en',
	parentId: homeDirId,
});
const [
	filesTogglingViewEnImgId,
	filesMovingEnImgId,
	filesMoveDialogEnImgId,
] = await Promise.all([
	createFile(
		{
			url: './assets/files-toggling-view-en.gif',
			directoryId: filesEnDirId,
			name: 'toggling-view.png',
			path: '/home/files-en/toggling-view.gif',
			title: 'toggling view',
			alt: 'toggling files view between list and tiles',
			mimetype: 'image/gif',
		},
		true,
	),
	createFile(
		{
			url: './assets/files-moving-en.gif',
			directoryId: filesEnDirId,
			name: 'moving.png',
			path: '/home/files-en/moving.gif',
			title: 'moving files',
			alt: 'moving files and directories',
			mimetype: 'image/gif',
		},
		true,
	),
	createFile(
		{
			url: './assets/files-move-dialog-en.png',
			directoryId: filesEnDirId,
			name: 'move-dialog.png',
			path: '/home/files-en/move-dialog.png',
			title: 'move dialog',
			alt: 'dialog with list of dirs to choose from',
			mimetype: 'image/png',
		},
		true,
	),
]);

await fs.mkdir(`${filesStoragePath}/home/files-pl`);
const [{ insertId: filesPlDirId }] = await db.insert(directories).values({
	name: 'files-pl',
	path: '/home/files-pl',
	parentId: homeDirId,
});
const [
	filesTogglingViewPlImgId,
	filesMovingPlImgId,
	filesMoveDialogPlImgId,
] = await Promise.all([
	createFile(
		{
			url: './assets/files-toggling-view-pl.gif',
			directoryId: filesPlDirId,
			name: 'toggling-view.png',
			path: '/home/files-pl/toggling-view.gif',
			title: 'przełączenie widoku',
			alt: 'przełączanie widoku między listą i kafelkami',
			mimetype: 'image/gif',
		},
		true,
	),
	createFile(
		{
			url: './assets/files-moving-pl.gif',
			directoryId: filesPlDirId,
			name: 'moving.png',
			path: '/home/files-pl/moving.gif',
			title: 'przesuwanie plików',
			alt: 'przesuwanie plików i folderów',
			mimetype: 'image/gif',
		},
		true,
	),
	createFile(
		{
			url: './assets/files-move-dialog-pl.png',
			directoryId: filesPlDirId,
			name: 'move-dialog.png',
			path: '/home/files-pl/move-dialog.png',
			title: 'dialog przesuwania',
			alt: 'dialog z listą folderów do wyboru',
			mimetype: 'image/png',
		},
		true,
	),
]);

await fs.mkdir(`${filesStoragePath}/home/global`);
const [{ insertId: globalDirId }] = await db.insert(directories).values({
	name: 'global',
	path: '/home/global',
	parentId: homeDirId,
});
const [
	globalEnImgId,
	globalPlImgId,
] = await Promise.all([
	createFile(
		{
			url: './assets/global-en.png',
			directoryId: globalDirId,
			name: 'global-en.png',
			path: '/home/global/global-en.png',
			title: 'global page',
			alt: 'css editor on page global',
			mimetype: 'image/png',
		},
		true,
	),
	createFile(
		{
			url: './assets/global-pl.png',
			directoryId: globalDirId,
			name: 'global-pl.png',
			path: '/home/global/global-pl.png',
			title: 'strona global',
			alt: 'edytor css na stronie global',
			mimetype: 'image/png',
		},
		true,
	),
]);

await fs.mkdir(`${filesStoragePath}/home/slider-en`);
const [{ insertId: sliderEnDirId }] = await db.insert(directories).values({
	name: 'slider-en',
	path: '/home/slider-en',
	parentId: homeDirId,
});
const [
	sliderFormEnImgId,
	sliderPreviewsEnImgId,
	sliderSettingsDialogEnImgId,
] = await Promise.all([
	createFile(
		{
			url: './assets/slider-form-en.png',
			directoryId: sliderEnDirId,
			name: 'form.png',
			path: '/home/slider-en/form.png',
			title: 'slide form',
			alt: 'slide form with html editor and slide attributes inputs',
			mimetype: 'image/png',
		},
		true,
	),
	createFile(
		{
			url: './assets/slider-previews-en.png',
			directoryId: sliderEnDirId,
			name: 'previews.png',
			path: '/home/slider-en/previews.png',
			title: 'slider previews',
			alt: 'single slide and whole slider previews',
			mimetype: 'image/png',
		},
		true,
	),
	createFile(
		{
			url: './assets/slider-settings-dialog-en.png',
			directoryId: sliderEnDirId,
			name: 'settings-dialog.png',
			path: '/home/slider-en/settings-dialog.png',
			title: 'slider settings dialog',
			alt: 'slider settings dialog with aspect ratio input',
			mimetype: 'image/png',
		},
		true,
	),
]);

await fs.mkdir(`${filesStoragePath}/home/slider-pl`);
const [{ insertId: sliderPlDirId }] = await db.insert(directories).values({
	name: 'slider-pl',
	path: '/home/slider-pl',
	parentId: homeDirId,
});
const [
	sliderFormPlImgId,
	sliderPreviewsPlImgId,
	sliderSettingsDialogPlImgId,
] = await Promise.all([
	createFile(
		{
			url: './assets/slider-form-pl.png',
			directoryId: sliderPlDirId,
			name: 'form.png',
			path: '/home/slider-pl/form.png',
			title: 'formularz slidera',
			alt: 'formularz html slide\'u z polami atrybutów slide\'u',
			mimetype: 'image/png',
		},
		true,
	),
	createFile(
		{
			url: './assets/slider-previews-pl.png',
			directoryId: sliderPlDirId,
			name: 'previews.png',
			path: '/home/slider-pl/previews.png',
			title: 'podgląd slidera',
			alt: 'podgląd pojedynczego slide\'u i całego slidera',
			mimetype: 'image/png',
		},
		true,
	),
	createFile(
		{
			url: './assets/slider-settings-dialog-pl.png',
			directoryId: sliderPlDirId,
			name: 'settings-dialog.png',
			path: '/home/slider-pl/settings-dialog.png',
			title: 'dialog ustawień slidera',
			alt: 'dialog ustawień slidera z polem aspect ratio',
			mimetype: 'image/png',
		},
		true,
	),
]);

await fs.mkdir(`${filesStoragePath}/home/footer`);
const [{ insertId: footerDirId }] = await db.insert(directories).values({
	name: 'footer',
	path: '/home/footer',
	parentId: homeDirId,
});
const [
	footerOverviewEnImgId,
	footerOverviewPlImgId,
	footerSocialsDialogEnImgId,
	footerSocialsDialogPlImgId,
] = await Promise.all([
	createFile(
		{
			url: './assets/footer-en.png',
			directoryId: footerDirId,
			name: 'overview-en.png',
			path: '/home/footer/overview-en.png',
			title: 'footer overview',
			alt: 'footer admin page with an interactive editor',
			mimetype: 'image/png',
		},
		true,
	),
	createFile(
		{
			url: './assets/footer-pl.png',
			directoryId: footerDirId,
			name: 'overview-pl.png',
			path: '/home/footer/overview-pl.png',
			title: 'overview stopki',
			alt: 'strona admin stopki z interaktywnym edytorem',
			mimetype: 'image/png',
		},
		true,
	),
	createFile(
		{
			url: './assets/footer-socials-en.png',
			directoryId: footerDirId,
			name: 'socials-en.png',
			path: '/home/footer/socials-en.png',
			title: 'socials dialog',
			alt: 'footer socials dialog with social links editor',
			mimetype: 'image/png',
		},
		true,
	),
	createFile(
		{
			url: './assets/footer-socials-pl.png',
			directoryId: footerDirId,
			name: 'socials-pl.png',
			path: '/home/footer/socials-pl.png',
			title: 'dialog sociali',
			alt: 'dialog sociali stopki z edytorem social linków',
			mimetype: 'image/png',
		},
		true,
	),
]);

const [settingsEnImgId, settingsPlImgId] = await Promise.all([
	createFile(
		{
			url: './assets/settings-en.png',
			directoryId: homeDirId,
			name: 'settings-en.png',
			path: '/home/settings-en.png',
			title: 'settings page',
			alt: 'admin settings page with change name and password forms',
			mimetype: 'image/png',
		},
		true,
	),
	createFile(
		{
			url: './assets/settings-pl.png',
			directoryId: homeDirId,
			name: 'settings-pl.png',
			path: '/home/settings-pl.png',
			title: 'strona ustawień',
			alt: 'strona ustawień admina z formularzami zmiany nazwy i hasła',
			mimetype: 'image/png',
		},
		true,
	),
]);

const enHomePageId = await createPage({
	language: 'en',
	title: 'Home',
	slug: '',
	menuText: 'home EN',
	parentId: null,
	position: 0,
	content: enHomePageContent([
		pagesTableEnImgId,
		pagesFormEnImgId,
		pagesHumbakFilesEnImgId,
		pagesHumbakFileTagImgId,
		menuOverviewEnImgId,
		menuMovingEnImgId,
		filesTogglingViewEnImgId,
		filesMovingEnImgId,
		filesMoveDialogEnImgId,
		globalEnImgId,
		sliderFormEnImgId,
		sliderPreviewsEnImgId,
		sliderSettingsDialogEnImgId,
		footerOverviewEnImgId,
		footerSocialsDialogEnImgId,
		settingsEnImgId,
	]),
});
const plHomePageId = await createPage({
	language: 'pl',
	title: 'Dom',
	slug: '',
	menuText: 'home PL',
	parentId: null,
	position: 0,
	content: plHomePageContent([
		pagesTablePlImgId,
		pagesFormPlImgId,
		pagesHumbakFilesPlImgId,
		pagesHumbakFileTagImgId,
		menuOverviewPlImgId,
		menuMovingPlImgId,
		filesTogglingViewPlImgId,
		filesMovingPlImgId,
		filesMoveDialogPlImgId,
		globalPlImgId,
		sliderFormPlImgId,
		sliderPreviewsPlImgId,
		sliderSettingsDialogPlImgId,
		footerOverviewPlImgId,
		footerSocialsDialogPlImgId,
		settingsPlImgId,
	]),
});

await db.insert(filesToPages).values([
	// home
	{ pageId: enHomePageId, fileId: pagesTableEnImgId },
	{ pageId: enHomePageId, fileId: pagesFormEnImgId },
	{ pageId: enHomePageId, fileId: pagesHumbakFilesEnImgId },
	{ pageId: enHomePageId, fileId: pagesHumbakFileTagImgId },
	{ pageId: plHomePageId, fileId: pagesTablePlImgId },
	{ pageId: plHomePageId, fileId: pagesFormPlImgId },
	{ pageId: plHomePageId, fileId: pagesHumbakFilesPlImgId },
	{ pageId: plHomePageId, fileId: pagesHumbakFileTagImgId },
	// menu
	{ pageId: enHomePageId, fileId: menuOverviewEnImgId },
	{ pageId: enHomePageId, fileId: menuMovingEnImgId },
	{ pageId: plHomePageId, fileId: menuMovingPlImgId },
	{ pageId: plHomePageId, fileId: menuMovingPlImgId },
	// files
	{ pageId: enHomePageId, fileId: filesTogglingViewEnImgId },
	{ pageId: enHomePageId, fileId: filesMovingEnImgId },
	{ pageId: enHomePageId, fileId: filesMoveDialogEnImgId },
	{ pageId: plHomePageId, fileId: filesTogglingViewPlImgId },
	{ pageId: plHomePageId, fileId: filesMovingPlImgId },
	{ pageId: plHomePageId, fileId: filesMoveDialogPlImgId },
	// global
	{ pageId: enHomePageId, fileId: globalEnImgId },
	{ pageId: plHomePageId, fileId: globalPlImgId },
	// slider
	{ pageId: enHomePageId, fileId: sliderFormEnImgId },
	{ pageId: enHomePageId, fileId: sliderPreviewsEnImgId },
	{ pageId: enHomePageId, fileId: sliderSettingsDialogEnImgId },
	{ pageId: plHomePageId, fileId: sliderFormPlImgId },
	{ pageId: plHomePageId, fileId: sliderPreviewsPlImgId },
	{ pageId: plHomePageId, fileId: sliderSettingsDialogPlImgId },
	// footer
	{ pageId: enHomePageId, fileId: footerOverviewEnImgId },
	{ pageId: enHomePageId, fileId: footerSocialsDialogEnImgId },
	{ pageId: plHomePageId, fileId: footerOverviewPlImgId },
	{ pageId: plHomePageId, fileId: footerSocialsDialogPlImgId },
	// settings
	{ pageId: enHomePageId, fileId: settingsEnImgId },
	{ pageId: plHomePageId, fileId: settingsPlImgId },
]);

const homePageCss = `.fancy-underline {
	font-weight: 700;
	transition: background-position 0.5s;
	background-clip: text;
	-webkit-background-clip: text;
	-moz-background-clip: text;
	color: black;
	outline-offset: 0.125em;
}

.fancy-underline:hover,
.fancy-underline:focus {
	color: transparent;
	background-image: linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet);
	animation: gradientMove 1.5s linear infinite;
}

@keyframes gradientMove {
	0% {
		filter: hue-rotate(0deg);
	}
	100% {
		filter: hue-rotate(359deg);
	}
}`;
await fs.writeFile(`${stylesheetsStoragePath}/${enHomePageId}.css`, homePageCss);
await fs.writeFile(`${stylesheetsStoragePath}/${plHomePageId}.css`, homePageCss);
// END
// home
console.timeLog('seed', 'home pages');
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
	title: 'Oceans',
	slug: 'oceans',
	menuText: 'Oceans',
	parentId: null,
	position: 0,
	content: enOceansPageContent([oceanPageImage1Id, oceanPageImage2Id, oceanPageImage3Id, oceanPageImage4Id]),
});
const plOceansPageId = await createPage({
	language: 'pl',
	title: 'Oceany',
	slug: 'oceany',
	menuText: 'Oceany',
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
console.timeLog('seed', 'oceans home page');
// END

// START
// seas home
// START
const [seasPageImage1Id, seasPageImage2Id] = await Promise.all([
	createFile({
		url: 'https://images.unsplash.com/photo-1424581342241-2b1aba4d3462',
		directoryId: seasDirId,
		name: 'sea-beach.jpg',
		path: '/seas/sea-beach.jpg',
		title: 'beach sea sunrise',
		alt: 'a sea at sunrise with beach close to the ground',
		mimetype: 'image/jpeg',
	}),
	createFile({
		url: 'https://images.unsplash.com/photo-1569567264003-e13b34c6b323',
		directoryId: seasDirId,
		name: 'sea-island.jpg',
		path: '/seas/sea-island.jpg',
		title: 'sea island',
		alt: 'a sea under a sunny sky with an island close in the distance',
		mimetype: 'image/jpeg',
	}),
]);
const enSeasPageId = await createPage({
	language: 'en',
	title: 'Seas',
	slug: 'seas',
	menuText: 'Seas',
	parentId: null,
	position: 1,
	content: enSeasPageContent([seasPageImage1Id, seasPageImage2Id]),
});
const plSeasPageId = await createPage({
	language: 'pl',
	title: 'Morza',
	slug: 'morza',
	menuText: 'Morza',
	parentId: null,
	position: 1,
	content: plSeasPageContent([seasPageImage1Id, seasPageImage2Id]),
});
await db.insert(filesToPages).values([
	{ pageId: enSeasPageId, fileId: seasPageImage1Id },
	{ pageId: enSeasPageId, fileId: seasPageImage2Id },
	{ pageId: plSeasPageId, fileId: seasPageImage1Id },
	{ pageId: plSeasPageId, fileId: seasPageImage2Id },
]);
// END
// seas home
console.timeLog('seed', 'seas home page');
// END

// START
// lakes home
// START
const [lakesPageImage1Id, lakesPageImage2Id, lakesPageImage3Id] = await Promise.all([
	createFile({
		url: 'https://images.unsplash.com/photo-1525088299396-2417f1366edd',
		directoryId: lakesDirId,
		name: 'many-lakes.jpg',
		path: '/lakes/many-lakes.jpg',
		title: 'many lakes',
		alt: 'a drone shot of many connected lakes during a sunny day with a clear sky',
		mimetype: 'image/jpeg',
	}),
	createFile({
		url: 'https://images.unsplash.com/photo-1531275090635-95f0974c3073',
		directoryId: lakesDirId,
		name: 'lake-forest-mountains.jpg',
		path: '/lakes/lake-forest-mountains.jpg',
		title: 'lake inside a forest',
		alt: 'a clearwater lake surrounded by a forest with mountains in the distance',
		mimetype: 'image/jpeg',
	}),
	createFile({
		url: 'https://images.unsplash.com/photo-1570106178002-deb401f6e4fc',
		directoryId: lakesDirId,
		name: 'cloudy-lake-hills.jpg',
		path: '/lakes/cloudy-lake-hills.jpg',
		title: 'lake surrounded by hills',
		alt: 'a lake surrounded by hills under a cloudy sky',
		mimetype: 'image/jpeg',
	}),
]);
const [lakesPageImage4Id, lakesPageImage5Id, lakesPageImage6Id] = await Promise.all([
	createFile({
		url: 'https://images.unsplash.com/photo-1500066210756-649d53a72901',
		directoryId: lakesDirId,
		name: 'lake-snowy-mountains.jpg',
		path: '/lakes/lake-snowy-mountains.jpg',
		title: 'snowy mountains lake',
		alt: 'a lake surrounded by snowy mountains covered in forests',
		mimetype: 'image/jpeg',
	}),
	createFile({
		url: 'https://images.unsplash.com/photo-1528492501711-867fd2c44bb5',
		directoryId: lakesDirId,
		name: 'cloudy-lake-mirror.jpg',
		path: '/lakes/cloud-lake-mirror.jpg',
		title: 'cloudy lake mirror',
		alt: 'a lake under a cloudy sky reflecting a mountain covered in a forest',
		mimetype: 'image/jpeg',
	}),
	createFile({
		url: 'https://images.unsplash.com/photo-1624239364354-93ae3e590f66',
		directoryId: lakesDirId,
		name: 'lake-mountain-mirror.jpg',
		path: '/lakes/lake-mountain-mirror.jpg',
		title: 'lake mountain mirror',
		alt: 'a mountain lake on a sunny day reflecting large mountains',
		mimetype: 'image/jpeg',
	}),
]);
const enLakesPageId = await createPage({
	language: 'en',
	title: 'Lakes',
	slug: 'lakes',
	menuText: 'Lakes',
	parentId: null,
	position: 2,
	content: enLakesPageContent([lakesPageImage1Id, lakesPageImage2Id, lakesPageImage3Id, lakesPageImage4Id, lakesPageImage5Id, lakesPageImage6Id]),
});
const plLakesPageId = await createPage({
	language: 'pl',
	title: 'Jeziora',
	slug: 'jeziora',
	menuText: 'Jeziora',
	parentId: null,
	position: 2,
	content: plLakesPageContent([lakesPageImage1Id, lakesPageImage2Id, lakesPageImage3Id, lakesPageImage4Id, lakesPageImage5Id, lakesPageImage6Id]),
});
await db.insert(filesToPages).values([
	{ pageId: enLakesPageId, fileId: lakesPageImage1Id },
	{ pageId: enLakesPageId, fileId: lakesPageImage2Id },
	{ pageId: enLakesPageId, fileId: lakesPageImage3Id },
	{ pageId: enLakesPageId, fileId: lakesPageImage4Id },
	{ pageId: enLakesPageId, fileId: lakesPageImage5Id },
	{ pageId: enLakesPageId, fileId: lakesPageImage6Id },
	{ pageId: plLakesPageId, fileId: lakesPageImage1Id },
	{ pageId: plLakesPageId, fileId: lakesPageImage2Id },
	{ pageId: plLakesPageId, fileId: lakesPageImage3Id },
	{ pageId: plLakesPageId, fileId: lakesPageImage4Id },
	{ pageId: plLakesPageId, fileId: lakesPageImage5Id },
	{ pageId: plLakesPageId, fileId: lakesPageImage6Id },
]);
// END
// lakes home
console.timeLog('seed', 'lakes home page');
// END

// START
// oceans atlantic
// START
await fs.mkdir(`${filesStoragePath}/oceans/atlantic`);
const [{ insertId: atlanticDirId }] = await db.insert(directories).values({
	name: 'atlantic',
	path: '/oceans/atlantic',
	parentId: oceansDirId,
});
const [atlanticPageImage1Id, atlanticPageImage2Id] = await Promise.all([
	createFile({
		url: 'https://science4fun.info/wp-content/uploads/2022/02/Atlantic-Ocean-Map.jpg',
		directoryId: atlanticDirId,
		name: 'atlantic-map.jpg',
		path: '/oceans/atlantic/atlantic-map.jpg',
		title: 'atlantic map',
		alt: 'map atlantic atlantic\'s ocean position',
		mimetype: 'image/jpeg',
	}),
	createFile({
		url: 'https://images.unsplash.com/photo-1475181624534-3e2ff2beb57c',
		directoryId: atlanticDirId,
		name: 'sea-storm-forming.jpg',
		path: '/oceans/atlantic/sea-storm-forming.jpg',
		title: 'sea storm forming',
		alt: 'a sea under a cloudy sky with storm and tornadoes forming in the distance',
		mimetype: 'image/jpeg',
	}),
]);
const enAtlanticPageId = await createPage({
	language: 'en',
	title: 'Atlantic ocean',
	slug: 'atlantic',
	menuText: 'Atlantic',
	parentId: enOceansPageId,
	position: 0,
	content: enAtlanticPageContent([atlanticPageImage1Id, atlanticPageImage2Id]),
});
const plAtlanticPageId = await createPage({
	language: 'pl',
	title: 'Ocean Atlantycki',
	slug: 'atlantyk',
	menuText: 'Atlantyk',
	parentId: plOceansPageId,
	position: 0,
	content: plAtlanticPageContent([atlanticPageImage1Id, atlanticPageImage2Id]),
});
await db.insert(filesToPages).values([
	{ pageId: enAtlanticPageId, fileId: atlanticPageImage1Id },
	{ pageId: enAtlanticPageId, fileId: atlanticPageImage2Id },
	{ pageId: plAtlanticPageId, fileId: atlanticPageImage1Id },
	{ pageId: plAtlanticPageId, fileId: atlanticPageImage2Id },
]);
// END
// oceans atlantic
console.timeLog('seed', 'oceans atlantic page');
// END

// START
// oceans pacific
// START
await fs.mkdir(`${filesStoragePath}/oceans/pacific`);
const [{ insertId: pacificDirId }] = await db.insert(directories).values({
	name: 'pacific',
	path: '/oceans/pacific',
	parentId: oceansDirId,
});
const [pacificPageImage1Id, pacificPageImage2Id] = await Promise.all([
	createFile({
		url: 'https://science4fun.info/wp-content/uploads/2022/02/Pacific-Ocean-Map.jpg',
		directoryId: pacificDirId,
		name: 'pacific-map.jpg',
		path: '/oceans/pacific/pacific-map.jpg',
		title: 'pacific map',
		alt: 'map highlighting the pacific ocean\'s position',
		mimetype: 'image/jpeg',
	}),
	createFile({
		url: 'https://images.unsplash.com/photo-1600583696773-472aafd3dd6c',
		directoryId: pacificDirId,
		name: 'coral-reef.jpg',
		path: '/oceans/pacific/coral-reef.jpg',
		title: 'coral reef',
		alt: 'a coral reef under water',
		mimetype: 'image/jpeg',
	}),
]);
const enPacificPageId = await createPage({
	language: 'en',
	title: 'Pacific ocean',
	slug: 'pacific',
	menuText: 'Pacific',
	parentId: enOceansPageId,
	position: 1,
	content: enPacificPageContent([pacificPageImage1Id, pacificPageImage2Id]),
});
const plPacificPageId = await createPage({
	language: 'pl',
	title: 'Ocean Pacyficzny',
	slug: 'pacyfik',
	menuText: 'Pacyfik',
	parentId: plOceansPageId,
	position: 1,
	content: plPacificPageContent([pacificPageImage1Id, pacificPageImage2Id]),
});
await db.insert(filesToPages).values([
	{ pageId: enPacificPageId, fileId: pacificPageImage1Id },
	{ pageId: enPacificPageId, fileId: pacificPageImage2Id },
	{ pageId: plPacificPageId, fileId: pacificPageImage1Id },
	{ pageId: plPacificPageId, fileId: pacificPageImage2Id },
]);
// END
// oceans pacific
console.timeLog('seed', 'oceans pacific page');
// END

// START
// oceans indian
// START
await fs.mkdir(`${filesStoragePath}/oceans/indian`);
const [{ insertId: indianDirId }] = await db.insert(directories).values({
	name: 'indian',
	path: '/oceans/indian',
	parentId: oceansDirId,
});
const [indianPageImage1Id] = await Promise.all([
	createFile({
		url: 'https://science4fun.info/wp-content/uploads/2022/06/Indian-Ocean-map.jpg',
		directoryId: indianDirId,
		name: 'indian-map.jpg',
		path: '/oceans/indian/indian-map.jpg',
		title: 'indian map',
		alt: 'map highlighting the indian ocean\'s position',
		mimetype: 'image/jpeg',
	}),
]);
const enIndianPageId = await createPage({
	language: 'en',
	title: 'Indian ocean',
	slug: 'indian-ocean',
	menuText: 'Indian Ocean',
	parentId: enOceansPageId,
	position: 2,
	content: enIndianPageContent([indianPageImage1Id]),
});
const plIndianPageId = await createPage({
	language: 'pl',
	title: 'Ocean Indyjski',
	slug: 'ocean-indyjski',
	menuText: 'Ocean Indyjski',
	parentId: plOceansPageId,
	position: 2,
	content: plIndianPageContent([indianPageImage1Id]),
});
await db.insert(filesToPages).values([
	{ pageId: enIndianPageId, fileId: indianPageImage1Id },
	{ pageId: plIndianPageId, fileId: indianPageImage1Id },
]);
// END
// oceans indian
console.timeLog('seed', 'oceans indian page');
// END

// START
// seas mediterranean
// START
await fs.mkdir(`${filesStoragePath}/seas/mediterranean`);
const [{ insertId: mediterraneanDirId }] = await db.insert(directories).values({
	name: 'mediterranean',
	path: '/seas/mediterranean',
	parentId: seasDirId,
});
const [mediterraneanPageImage1Id, mediterraneanPageImage2Id] = await Promise.all([
	createFile({
		url: 'https://www.drishtiias.com/images/uploads/1665481057_Mediterranean_Sea_Drishti_IAS_English.png',
		directoryId: mediterraneanDirId,
		name: 'map.jpg',
		path: '/seas/mediterranean/map.jpg',
		title: 'mediterranean map',
		alt: 'mediterranean sea\'s map',
		mimetype: 'image/jpeg',
	}),
	createFile({
		url: 'https://images.unsplash.com/photo-1596103716734-a4b44d6c9892',
		directoryId: mediterraneanDirId,
		name: 'greece.jpg',
		path: '/seas/mediterranean/greece.jpg',
		title: 'greece',
		alt: 'aerial view of a greece city next to the sea on a sunny day',
		mimetype: 'image/jpeg',
	}),
]);
const enMediterraneanPageId = await createPage({
	language: 'en',
	title: 'Mediterranean sea',
	slug: 'mediterranean-sea',
	menuText: 'Mediterranean sea',
	parentId: enSeasPageId,
	position: 0,
	content: enMediterraneanPageContent([mediterraneanPageImage1Id, mediterraneanPageImage2Id]),
});
const plMediterraneanPageId = await createPage({
	language: 'pl',
	title: 'Morze Śródziemne',
	slug: 'morze-srodziemne',
	menuText: 'Morze Śródziemne',
	parentId: plSeasPageId,
	position: 0,
	content: plMediterraneanPageContent([mediterraneanPageImage1Id, mediterraneanPageImage2Id]),
});
await db.insert(filesToPages).values([
	{ pageId: enMediterraneanPageId, fileId: mediterraneanPageImage1Id },
	{ pageId: enMediterraneanPageId, fileId: mediterraneanPageImage2Id },
	{ pageId: plMediterraneanPageId, fileId: mediterraneanPageImage1Id },
	{ pageId: plMediterraneanPageId, fileId: mediterraneanPageImage2Id },
]);
// END
// seas mediterranean
console.timeLog('seed', 'seas mediterranean page');
// END

// START
// seas baltic
// START
await fs.mkdir(`${filesStoragePath}/seas/baltic`);
const [{ insertId: balticDirId }] = await db.insert(directories).values({
	name: 'baltic',
	path: '/seas/baltic',
	parentId: seasDirId,
});
const [balticPageImage1Id, balticPageImage2Id] = await Promise.all([
	createFile({
		url: 'https://upload.wikimedia.org/wikipedia/commons/9/92/Baltic_Sea_map.png',
		directoryId: balticDirId,
		name: 'map.jpg',
		path: '/seas/baltic/map.jpg',
		title: 'baltic map',
		alt: 'baltic sea\'s map',
		mimetype: 'image/jpeg',
	}),
	createFile({
		url: 'https://images.unsplash.com/photo-1587731233770-aa67fd11e81d',
		directoryId: balticDirId,
		name: 'beach.jpg',
		path: '/seas/baltic/beach.jpg',
		title: 'baltic beach',
		alt: 'a fenced path to the beach with sea in the distance during the day',
		mimetype: 'image/jpeg',
	}),
]);
const enBalticPageId = await createPage({
	language: 'en',
	title: 'Baltic Sea',
	slug: 'baltic-sea',
	menuText: 'Baltic Sea',
	parentId: enSeasPageId,
	position: 1,
	content: enBalticPageContent([balticPageImage1Id, balticPageImage2Id]),
});
const plBalticPageId = await createPage({
	language: 'pl',
	title: 'Morze Bałtyckie',
	slug: 'morze-baltyckie',
	menuText: 'Morze Bałtyckie',
	parentId: plSeasPageId,
	position: 1,
	content: plBalticPageContent([balticPageImage1Id, balticPageImage2Id]),
});
await db.insert(filesToPages).values([
	{ pageId: enBalticPageId, fileId: balticPageImage1Id },
	{ pageId: enBalticPageId, fileId: balticPageImage2Id },
	{ pageId: plBalticPageId, fileId: balticPageImage1Id },
	{ pageId: plBalticPageId, fileId: balticPageImage2Id },
]);
// END
// seas baltic
console.timeLog('seed', 'seas baltic page');
// END

// START
// seas black
// START
await fs.mkdir(`${filesStoragePath}/seas/black`);
const [{ insertId: blackDirId }] = await db.insert(directories).values({
	name: 'black',
	path: '/seas/black',
	parentId: seasDirId,
});
const [blackPageImage1Id, blackPageImage2Id, blackPageImage3Id] = await Promise.all([
	createFile({
		url: 'https://images.unsplash.com/photo-1613934696606-854c849b8eaf',
		directoryId: blackDirId,
		name: 'beach-sunset.jpg',
		path: '/seas/black/beach-sunset.jpg',
		title: 'beach sunset',
		alt: 'beach at sunset with clouded sky in the distance',
		mimetype: 'image/jpeg',
	}),
	createFile({
		url: 'https://images.unsplash.com/photo-1621597357988-c9a41208ec56',
		directoryId: blackDirId,
		name: 'rocks-sea-shore.jpg',
		path: '/seas/black/rocks-sea-shore.jpg',
		title: 'rocks sea shore',
		alt: 'rocks in the sea on the coast seen from above',
		mimetype: 'image/jpeg',
	}),
	createFile({
		url: 'https://upload.wikimedia.org/wikipedia/commons/5/52/Black_Sea_map.png',
		directoryId: blackDirId,
		name: 'map.jpg',
		path: '/seas/black/map.jpg',
		title: 'black map',
		alt: 'black sea\'s map',
		mimetype: 'image/jpeg',
	}),
]);
const enBlackPageId = await createPage({
	language: 'en',
	title: 'Black Sea',
	slug: 'black-sea',
	menuText: 'Black Sea',
	parentId: enSeasPageId,
	position: 2,
	content: enBlackPageContent([blackPageImage1Id, blackPageImage2Id, blackPageImage3Id]),
});
const plBlackPageId = await createPage({
	language: 'pl',
	title: 'Morze Czarne',
	slug: 'morze-czarne',
	menuText: 'Morze Czarne',
	parentId: plSeasPageId,
	position: 2,
	content: plBlackPageContent([blackPageImage1Id, blackPageImage2Id, blackPageImage3Id]),
});
await db.insert(filesToPages).values([
	{ pageId: enBlackPageId, fileId: blackPageImage1Id },
	{ pageId: enBlackPageId, fileId: blackPageImage2Id },
	{ pageId: enBlackPageId, fileId: blackPageImage3Id },
	{ pageId: plBlackPageId, fileId: blackPageImage1Id },
	{ pageId: plBlackPageId, fileId: blackPageImage2Id },
	{ pageId: plBlackPageId, fileId: blackPageImage3Id },
]);
// END
// seas black
console.timeLog('seed', 'seas black page');
// END

// START
// lakes great
// START
await fs.mkdir(`${filesStoragePath}/lakes/great`);
const [{ insertId: greatDirId }] = await db.insert(directories).values({
	name: 'great',
	path: '/lakes/great',
	parentId: lakesDirId,
});
const [greatPageImage1Id, greatPageImage2Id, greatPageImage3Id] = await Promise.all([
	createFile({
		url: 'https://images.unsplash.com/photo-1487006113199-30fc89dd54e9',
		directoryId: greatDirId,
		name: 'michigan.jpg',
		path: '/lakes/great/michigan.jpg',
		title: 'lake Michigan',
		alt: 'an aerial view of the Lake Michigan\'s shore with autumn forest in the distance',
		mimetype: 'image/jpeg',
	}),
	createFile({
		url: 'https://images.unsplash.com/photo-1642573941638-dab66dd8d954',
		directoryId: greatDirId,
		name: 'huron.jpg',
		path: '/lakes/great/huron.jpg',
		title: 'lake Huron',
		alt: 'a lake seen from the shore on a sunny day with islands in the distance',
		mimetype: 'image/jpeg',
	}),
	createFile({
		url: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Great-Lakes.svg',
		directoryId: greatDirId,
		name: 'map.svg',
		path: '/lakes/great/map.svg',
		title: 'great lakes map',
		alt: 'the great lakes\' map',
		mimetype: 'image/svg+xml',
	}),
]);
const enGreatPageId = await createPage({
	language: 'en',
	title: 'The Great Lakes',
	slug: 'great-lakes',
	menuText: 'The Great Lakes',
	parentId: enLakesPageId,
	position: 0,
	content: enGreatLakesPageContent([greatPageImage1Id, greatPageImage2Id, greatPageImage3Id]),
});
const plGreatPageId = await createPage({
	language: 'pl',
	title: 'Wielkie Jeziora',
	slug: 'wielkie-jeziora',
	menuText: 'Wielkie Jeziora',
	parentId: plLakesPageId,
	position: 0,
	content: plGreatLakesPageContent([greatPageImage1Id, greatPageImage2Id, greatPageImage3Id]),
});
await db.insert(filesToPages).values([
	{ pageId: enGreatPageId, fileId: greatPageImage1Id },
	{ pageId: enGreatPageId, fileId: greatPageImage2Id },
	{ pageId: enGreatPageId, fileId: greatPageImage3Id },
	{ pageId: plGreatPageId, fileId: greatPageImage1Id },
	{ pageId: plGreatPageId, fileId: greatPageImage2Id },
	{ pageId: plGreatPageId, fileId: greatPageImage3Id },
]);
// END
// lakes great
console.timeLog('seed', 'lakes great page');
// END

// START
// lakes baikal
// START
await fs.mkdir(`${filesStoragePath}/lakes/baikal`);
const [{ insertId: baikalDirId }] = await db.insert(directories).values({
	name: 'baikal',
	path: '/lakes/baikal',
	parentId: lakesDirId,
});
const [baikalPageImage1Id, baikalPageImage2Id] = await Promise.all([
	createFile({
		url: 'https://cdn.britannica.com/73/171673-004-803CD9C6.jpg',
		directoryId: baikalDirId,
		name: 'map.jpg',
		path: '/lakes/baikal/map.jpg',
		title: 'map',
		alt: 'baikal\'s lake map',
		mimetype: 'image/jpeg',
	}),
	createFile({
		url: 'https://images.unsplash.com/photo-1553785063-9e892a3f15b6',
		directoryId: baikalDirId,
		name: 'frozen.jpg',
		path: '/lakes/baikal/frozen.jpg',
		title: 'frozen Baikal',
		alt: 'frozen Baikal Lake with a rocky shore on the right and an island in the distance',
		mimetype: 'image/jpeg',
	}),
]);
const enBaikalPageId = await createPage({
	language: 'en',
	title: 'Baikal Lake',
	slug: 'baikal-lake',
	menuText: 'Baikal Lake',
	parentId: enLakesPageId,
	position: 1,
	content: enBaikalLakesPageContent([baikalPageImage1Id, baikalPageImage2Id]),
});
const plBaikalPageId = await createPage({
	language: 'pl',
	title: 'Bajkał',
	slug: 'jezioro-bajkal',
	menuText: 'Bajkał',
	parentId: plLakesPageId,
	position: 1,
	content: plBaikalLakesPageContent([baikalPageImage1Id, baikalPageImage2Id]),
});
await db.insert(filesToPages).values([
	{ pageId: enBaikalPageId, fileId: baikalPageImage1Id },
	{ pageId: enBaikalPageId, fileId: baikalPageImage2Id },
	{ pageId: plBaikalPageId, fileId: baikalPageImage1Id },
	{ pageId: plBaikalPageId, fileId: baikalPageImage2Id },
]);
// END
// lakes baikal
console.timeLog('seed', 'lakes baikal page');
// END

// START
// lakes caspian
// START
await fs.mkdir(`${filesStoragePath}/lakes/caspian`);
const [{ insertId: caspianDirId }] = await db.insert(directories).values({
	name: 'caspian',
	path: '/lakes/caspian',
	parentId: lakesDirId,
});
const [caspianPageImage1Id, caspianPageImage2Id] = await Promise.all([
	createFile({
		url: 'https://www.nationsonline.org/maps/Caspian-Sea-map.jpg',
		directoryId: caspianDirId,
		name: 'map.png',
		path: '/lakes/caspian/map.png',
		title: 'map',
		alt: 'caspian\'s sea map',
		mimetype: 'image/png',
	}),
	createFile({
		url: 'https://images.unsplash.com/photo-1462331321792-cc44368b8894',
		directoryId: caspianDirId,
		name: 'tyuleniy-archipelago.jpg',
		path: '/lakes/caspian/tyuleniy-archipelago.jpg',
		title: 'tyuleniy archipelago',
		alt: 'stylized tyuleniy archipelago from the orbit',
		mimetype: 'image/jpeg',
	}),
]);
const enCaspianPageId = await createPage({
	language: 'en',
	title: 'Caspian Sea',
	slug: 'caspian-sea',
	menuText: 'Caspian Sea',
	parentId: enLakesPageId,
	position: 2,
	content: enCaspianLakesPageContent([caspianPageImage1Id, caspianPageImage2Id]),
});
const plCaspianPageId = await createPage({
	language: 'pl',
	title: 'Morze Kaspijskie',
	slug: 'morze-kaspijskie',
	menuText: 'Morze Kaspijskie',
	parentId: plLakesPageId,
	position: 2,
	content: plCaspianLakesPageContent([caspianPageImage1Id, caspianPageImage2Id]),
});
await db.insert(filesToPages).values([
	{ pageId: enCaspianPageId, fileId: caspianPageImage1Id },
	{ pageId: enCaspianPageId, fileId: caspianPageImage2Id },
	{ pageId: plCaspianPageId, fileId: caspianPageImage1Id },
	{ pageId: plCaspianPageId, fileId: caspianPageImage2Id },
]);
// END
// lakes caspian
console.timeLog('seed', 'lakes caspian page');
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
console.timeLog('seed', 'footer home pages');
// END

await db.insert(users).values({
	id: 'test',
	username: 'test',
	password: await hashPassword('test'),
});

await pool.end();

console.timeEnd('seed');

async function createFile(
	{ url, name, directoryId, path, title, alt, mimetype }: {
		url: string;
		name: string;
		directoryId: number | null;
		path: string;
		title: string;
		alt: string;
		mimetype: string;
	},
	isLocal = false,
) {
	if (isLocal) {
		await fs.cp(resolve(currentDir, url), `${filesStoragePath}${path}`);
	} else {
		await fs.writeFile(
			`${filesStoragePath}${path}`,
			await fetch(`${url}?q=80&w=1920`).then(r => r.arrayBuffer()).then(v => Buffer.from(v)),
		);
	}

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

	const { value } = await parseHumbakHtml(content, db);

	await Promise.all([
		db.insert(menuLinks).values({ text: menuText, pageId, position, parentId }),
		db.insert(contents).values({ pageId, rawHtml: content, parsedHtml: value }),
		fs.writeFile(`${stylesheetsStoragePath}/${pageId}.css`, ''),
	]);

	return pageId;
}

async function createSlide({ name, language, content, isHidden }: { name: string; language: string; content: string; isHidden?: boolean }) {
	const { value } = await parseHumbakHtml(content, db);

	return {
		name,
		language,
		isHidden,
		rawContent: content,
		parsedContent: value,
	};
}
