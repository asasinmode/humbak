import { hc } from 'hono/client';
import type { InferResponseType } from 'hono/client';
import type { AppType } from '@humbak/api/src/index';
import { env } from '~/env';

const client = hc<AppType>(env.VITE_API_URL);

export const useApi = () => client;

export type IListedPage = Awaited<ReturnType<typeof client['pages']['list']['query']>>[number];
export type IUniqueLanguage = Awaited<ReturnType<typeof client['pages']['uniqueLanguages']['query']>>[number];
export type IUpsertPageInput = Parameters<typeof client['pages']['upsert']['mutate']>[0];
export type ISlide = Awaited<ReturnType<typeof client['slides']['byId']['query']>>;
export type IListedSlide = Awaited<ReturnType<typeof client['slides']['list']['query']>>[number];
export type IPublicListedSlide = Awaited<ReturnType<typeof client['slides']['listPublic']['query']>>[number];
export type IFooterContents = InferResponseType<typeof client['footer']['$get']>;
export type IMenuLink = InferResponseType<typeof client['menuLinks']['$get']>;
