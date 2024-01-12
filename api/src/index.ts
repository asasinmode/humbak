import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { env } from './env';
import { filesStoragePath, stylesheetsStoragePath } from './helpers/files';
import { app as pagesApp } from './routes/pages';
import { app as filesApp } from './routes/files';
import { app as slidesApp } from './routes/slides';
import { app as globalCssApp } from './routes/globalCss';
import { app as languagesApp } from './routes/languages';
import { app as menuLinksApp } from './routes/menuLinks';
import { app as directoriesApp } from './routes/directories';
import { app as footerContentsApp } from './routes/footerContents';

!existsSync(filesStoragePath) && await mkdir(filesStoragePath, { recursive: true });
!existsSync(stylesheetsStoragePath) && await mkdir(stylesheetsStoragePath, { recursive: true });
!existsSync(`${stylesheetsStoragePath}/global.css`) && await writeFile(`${stylesheetsStoragePath}/global.css`, '');

const app = new Hono();

app.use('/*', cors({
	origin: env.ADMIN_URL,
}));

app.get('/', (c) => {
	return c.text('hi');
});

app.use('/public/*', serveStatic({
	root: '.',
}));

const typedApp = app
	.route('/footerContents', footerContentsApp)
	.route('/globalCss', globalCssApp)
	.route('/languages', languagesApp)
	.route('/menuLinks', menuLinksApp)
	.route('/pages', pagesApp)
	.route('/slides', slidesApp)
	.route('/directories', directoriesApp)
	.route('/files', filesApp);

serve({ port: env.PORT, fetch: app.fetch }, (info) => {
	console.log(`server listening on\x1B[36m http://localhost:${info.port}/ \x1B[0m`);
});

export type AppType = typeof typedApp;
