import path from 'node:path';
import process from 'node:process';
import url from 'node:url';
import confirm from '@inquirer/confirm';
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/mysql2';
import { createPool } from 'mysql2/promise';
import { getPathWithoutExtension } from '~~/shared/utils';
import { contents } from '../schema/contents';
import { directories } from '../schema/directories';
import { files } from '../schema/files';
import { filesToPages } from '../schema/filesToPages';
import { filesToSlides } from '../schema/filesToSlides';
import { footerContents } from '../schema/footerContents';
import { menuLinks } from '../schema/menuLinks';
import { meta } from '../schema/meta';
import { pages } from '../schema/pages';
import { slideAspectRatio } from '../schema/slideAspectRatio';

import { slides } from '../schema/slides';
import { users } from '../schema/users';

if ((globalThis as { useRuntimeConfig?: typeof useRuntimeConfig }).useRuntimeConfig) {
	throw new Error('this file should not be included in nuxt runtime. it\'s meant for scripts and tests');
}

config({
	path: process.env.NODE_ENV === 'test'
		? '.env.test'
		: process.env.NODE_ENV === 'production'
			? '.env.prod'
			: '.env',
});

const dirname = path.dirname(url.fileURLToPath(import.meta.url));

// imitate nuxt auto imports in scripts & tests, types are there anyway so
const g = globalThis as unknown as {
	pool: typeof pool;
	db: typeof db;
	filesStoragePath: typeof filesStoragePath;
	stylesheetsStoragePath: typeof stylesheetsStoragePath;
	tables: typeof tables;
	getPathWithoutExtension: typeof getPathWithoutExtension;
};

g.pool = createPool(process.env.NUXT_DATABASE_URL!);
g.db = drizzle(pool);

g.filesStoragePath = path.resolve(dirname, '../../..', process.env.NUXT_FILES_PATH!);
g.stylesheetsStoragePath = path.resolve(dirname, '../../..', process.env.NUXT_STYLESHEETS_PATH!);
g.tables = {
	contents,
	directories,
	files,
	filesToPages,
	filesToSlides,
	footerContents,
	menuLinks,
	meta,
	pages,
	slideAspectRatio,
	slides,
	users,
};

g.getPathWithoutExtension = getPathWithoutExtension;

export async function promptProdContinue() {
	let shouldContinue = true;

	if (process.env.NODE_ENV === 'production') {
		shouldContinue = await confirm({ message: 'Are you sure?', default: false }) as boolean;
	}

	!shouldContinue && process.exit(0);
}

export async function getTableNames() {
	const queryResult = await pool.execute(
		`SELECT table_name as table_name FROM information_schema.tables
		WHERE table_schema = '${process.env.NUXT_DATABASE_NAME}' AND table_name != 'pages'`,
	);

	return queryResult[0] as { table_name: string }[];
}
