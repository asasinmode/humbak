import { fileURLToPath } from 'node:url';
import fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { createContext } from '~/router/context';
import { appRouter } from '~/router';

import { env } from '~/env';

const server = fastify();

await server.register(cors, {
	origin: env.ADMIN_URL,
});

server.get('/', (_, res) => {
	return res.send('hi');
});

await server.register(fastifyStatic, {
	root: fileURLToPath(new URL('../public', import.meta.url)),
	prefix: '/public/',
});

await server.register(fastifyTRPCPlugin, {
	prefix: '/',
	trpcOptions: { router: appRouter, createContext },
});

await server.listen({ port: env.PORT });

console.log(`server listening on\x1B[36m http://localhost:${env.PORT}/ \x1B[0m`);
