import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@humbak/api/src/router';
import { env } from '~/env';

export const useApi = createTRPCProxyClient<AppRouter>({
	links: [
		httpBatchLink({
			url: env.VITE_API_URL,
		}),
	],
});
