import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { env } from './env';
import { filesStoragePath, stylesheetsStoragePath } from './helpers/files';
import { app as authApp } from './routes/auth';
import { app as directoriesApp } from './routes/directories';
import { app as filesApp } from './routes/files';
import { app as footerContentsApp } from './routes/footerContents';
import { app as globalCssApp } from './routes/globalCss';
import { app as languagesApp } from './routes/languages';
import { app as menuLinksApp } from './routes/menuLinks';
import { app as metaApp } from './routes/meta';
import { app as pagesApp } from './routes/pages';
import { app as publicApp } from './routes/public';
import { app as slidesApp } from './routes/slides';

!existsSync(filesStoragePath) && await mkdir(filesStoragePath, { recursive: true });
!existsSync(stylesheetsStoragePath) && await mkdir(stylesheetsStoragePath, { recursive: true });
!existsSync(`${stylesheetsStoragePath}/global.css`) && await writeFile(`${stylesheetsStoragePath}/global.css`, '');

const app = new Hono();

app.use('/*', cors({
	origin: [env.ADMIN_URL, env.PAGE_URL],
}));

app.use('/*', serveStatic({
	root: './public',
}));

// eslint-disable-next-line unused-imports/no-unused-vars
const typedApp = app
	.route('/auth', authApp)
	.route('/footerContents', footerContentsApp)
	.route('/globalCss', globalCssApp)
	.route('/languages', languagesApp)
	.route('/menuLinks', menuLinksApp)
	.route('/pages', pagesApp)
	.route('/slides', slidesApp)
	.route('/directories', directoriesApp)
	.route('/files', filesApp)
	.route('/meta', metaApp)
	.route('/public', publicApp);

serve({ port: env.PORT, fetch: app.fetch }, (info) => {
	console.log(`server listening on\x1B[36m http://localhost:${info.port}/ \x1B[0m`);
});

export type AppType = typeof typedApp;
