import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { env } from './env';
import { app as footerContentsRoute } from './routes/footerContents';
import { app as globalCssRoute } from './routes/globalCss';
import { app as languagesRoute } from './routes/languages';
import { app as menuLinksRoute } from './routes/menuLinks';
import { app as pagesRoute } from './routes/pages';
import { app as slidesRoute } from './routes/slides';

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
	.route('/footerContents', footerContentsRoute)
	.route('/globalCss', globalCssRoute)
	.route('/languages', languagesRoute)
	.route('/menuLinks', menuLinksRoute)
	.route('/pages', pagesRoute)
	.route('/slides', slidesRoute);

serve({ port: env.PORT, fetch: app.fetch }, (info) => {
	console.log(`server listening on\x1B[36m http://localhost:${info.port}/ \x1B[0m`);
});

export type AppType = typeof typedApp;
