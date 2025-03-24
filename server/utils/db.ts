import path from 'node:path';
import url from 'node:url';
import { drizzle } from 'drizzle-orm/mysql2';
import { createPool } from 'mysql2/promise';
import { contents } from '../db/schema/contents';
import { directories } from '../db/schema/directories';
import { files } from '../db/schema/files';
import { filesToPages } from '../db/schema/filesToPages';
import { filesToSlides } from '../db/schema/filesToSlides';
import { footerContents } from '../db/schema/footerContents';
import { menuLinks } from '../db/schema/menuLinks';
import { meta } from '../db/schema/meta';
import { pages } from '../db/schema/pages';
import { slideAspectRatio } from '../db/schema/slideAspectRatio';

import { slides } from '../db/schema/slides';
import { users } from '../db/schema/users';

export const pool = createPool(useRuntimeConfig().databaseUrl);

export const tables = {
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

const dirname = path.dirname(url.fileURLToPath(import.meta.url));

export const filesStoragePath = path.resolve(dirname, useRuntimeConfig().filesPath);
export const stylesheetsStoragePath = path.resolve(dirname, useRuntimeConfig().stylesheetsPath);

export const db = drizzle(pool);
