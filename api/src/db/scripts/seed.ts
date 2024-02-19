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
import {
	enHomePageContent,
	plHomePageContent,
	enLakesPageContent,
	plLakesPageContent,
	enOceansPageContent,
	plOceansPageContent,
	enSeasPageContent,
	plSeasPageContent,
	enAtlanticPageContent,
	plAtlanticPageContent,
	enPacificPageContent,
	plPacificPageContent,
	enIndianPageContent,
	plIndianPageContent,
	enMediterraneanPageContent,
	plMediterraneanPageContent,
	enBalticPageContent,
	plBalticPageContent
} from './helpers';

await promptProdContinue();

await writeFile(`${stylesheetsStoragePath}/global.css`, `.text-slider {
	font-size: clamp(4rem, 1.3333rem + 13.3333vi, 12rem);
	font-weight: 600;
}`);

console.time('seed');

// START
// slide images
console.timeLog('seed', 'slide images');
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
console.timeLog('seed', 'misc files');
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
console.timeLog('seed', 'slides');
// START
const [slideAspectRatioResult] = await db.select({ value: slideAspectRatio.value }).from(slideAspectRatio);
!slideAspectRatioResult && await db.insert(slideAspectRatio).values({ value: '1 / 3' });

const [{ insertId: enSlideInsertId }] = await db.insert(slides).values(await Promise.all([
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
		style="bottom: 0.3rem; right: 0.5rem; color: white;"
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
		style="bottom: 0.3rem; right: 0.5rem; color: black; text-shadow: white 1px 1px 1px;"
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
		style="bottom: 0.3rem; right: 0.5rem; color: black; text-shadow: white 1px 1px 1px;"
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
// END

// START
// home
console.timeLog('seed', 'home pages');
// START
const enHomePageId = await createPage({
	language: 'en',
	title: 'Home',
	slug: '',
	menuText: 'home EN',
	parentId: null,
	position: 0,
	content: enHomePageContent,
});

const plHomePageId = await createPage({
	language: 'pl',
	title: 'Dom',
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
console.timeLog('seed', 'oceans home pages');
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
// END

// START
// seas home
console.timeLog('seed', 'seas home pages');
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
// END

// START
// lakes home
console.timeLog('seed', 'lakes home pages');
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
// END

// START
// oceans atlantic
console.timeLog('seed', 'oceans atlantic page');
// START
await mkdir(`${filesStoragePath}/oceans/atlantic`);
const [{ insertId: atlanticDirId }] = await db.insert(directories).values({
	name: 'atlantic',
	path: '/oceans/atlantic',
	parentId: oceansDirId
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
// END

// START
// oceans pacific
console.timeLog('seed', 'oceans pacific page');
// START
await mkdir(`${filesStoragePath}/oceans/pacific`);
const [{ insertId: pacificDirId }] = await db.insert(directories).values({
	name: 'pacific',
	path: '/oceans/pacific',
	parentId: oceansDirId
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
// END

// START
// oceans indian
console.timeLog('seed', 'oceans indian page');
// START
await mkdir(`${filesStoragePath}/oceans/indian`);
const [{ insertId: indianDirId }] = await db.insert(directories).values({
	name: 'indian',
	path: '/oceans/indian',
	parentId: oceansDirId
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
	slug: 'indian',
	menuText: 'Indian Ocean',
	parentId: enOceansPageId,
	position: 2,
	content: enIndianPageContent([indianPageImage1Id]),
});
const plIndianPageId = await createPage({
	language: 'pl',
	title: 'Ocean Indyjski',
	slug: 'indyjski',
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
// END

// START
// seas mediterranean
console.timeLog('seed', 'seas mediterranean page');
// START
await mkdir(`${filesStoragePath}/seas/mediterranean`);
const [{ insertId: mediterraneanDirId }] = await db.insert(directories).values({
	name: 'mediterranean',
	path: '/seas/mediterranean',
	parentId: seasDirId
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
	slug: 'mediterranean',
	menuText: 'Mediterranean sea',
	parentId: enSeasPageId,
	position: 0,
	content: enMediterraneanPageContent([mediterraneanPageImage1Id, mediterraneanPageImage2Id]),
});
const plMediterraneanPageId = await createPage({
	language: 'pl',
	title: 'Morze Śródziemne',
	slug: 'srodziemne',
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
// END

// START
// seas baltic
console.timeLog('seed', 'seas baltic page');
// START
await mkdir(`${filesStoragePath}/seas/baltic`);
const [{ insertId: balticDirId }] = await db.insert(directories).values({
	name: 'baltic',
	path: '/seas/baltic',
	parentId: seasDirId
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
	title: 'Baltic sea',
	slug: 'baltic',
	menuText: 'Baltic sea',
	parentId: enSeasPageId,
	position: 1,
	content: enBalticPageContent([balticPageImage1Id, balticPageImage2Id]),
});
const plBalticPageId = await createPage({
	language: 'pl',
	title: 'Morze Bałtyckie',
	slug: 'baltyckie',
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
// END

// START
// footer
console.timeLog('seed', 'footer home pages');
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

console.timeEnd('seed');

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

