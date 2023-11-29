import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { app as footerApp } from '~/routes/footer';

import { env } from '~/env';

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

app.route('/footer', footerApp);

serve({ port: env.PORT, fetch: app.fetch }, (info) => {
	console.log(`server listening on\x1B[36m http://localhost:${info.port}/ \x1B[0m`);
});

export type AppType = typeof app;
