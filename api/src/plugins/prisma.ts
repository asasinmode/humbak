import fp from 'fastify-plugin';
import { PrismaClient } from '@prisma/client';

import type { FastifyPluginAsync } from 'fastify';

declare module 'fastify' {
	interface FastifyInstance {
		prisma: PrismaClient;
	}
}

export const prisma: FastifyPluginAsync = fp(async (server) => {
	const prisma = new PrismaClient();

	await prisma.$connect();

	server.decorate('prisma', prisma);

	server.addHook('onClose', async (server) => {
		await server.prisma.$disconnect();
	});
});
