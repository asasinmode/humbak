import fastify from 'fastify';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { createContext } from '@/router/context';
import { appRouter } from '@/router';
import { env } from '@/env';

const server = fastify();

server.register(fastifyTRPCPlugin, {
	prefix: '/',
	trpcOptions: { router: appRouter, createContext },
});

server.listen({ port: env.PORT }).then(() => console.log('server listening on', env.PORT));
