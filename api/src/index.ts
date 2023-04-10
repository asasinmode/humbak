import fastify from 'fastify';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { createContext } from '~/router/context';
import { appRouter } from '~/router';
import { env } from '~/env';

const server = fastify();

server.get('/', (req, res) => {
	return res.send('hi');
});

await server.register(fastifyTRPCPlugin, {
	prefix: '/',
	trpcOptions: { router: appRouter, createContext },
});

await server.listen({ port: env.PORT });

console.log(`server listening on\x1B[36m http://localhost:${env.PORT}/ \x1B[0m`);
