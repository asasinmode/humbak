import fastify from 'fastify';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { createContext } from '~/router/context';
import { appRouter } from '~/router';
import { prisma } from '~/plugins/prisma';
import { env } from '~/env';

const server = fastify();

server.get('/', (req, res) => {
	res.send('hi');
});

server.register(fastifyTRPCPlugin, {
	prefix: '/',
	trpcOptions: { router: appRouter, createContext },
});

server.register(prisma);

server.listen({ port: env.PORT }).then(() => {
	console.log(`server listening on \x1B[36m http://localhost:${env.PORT}/ \x1B[0m`);
});
