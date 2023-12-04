import { hc } from 'hono/client';
import type { InferRequestType, InferResponseType } from 'hono/client';
import type { AppType } from '@humbak/api/src';
import { env } from '~/env';

const client = hc<AppType>(env.VITE_API_URL);

export const useApi = () => client;

type Client = typeof client;

export type IFooterContents = InferResponseType<Client['footerContents']['$get']>;
export type IMenuLink = InferResponseType<Client['menuLinks']['$get']>[number];
export type IUniqueLanguage = InferResponseType<Client['languages']['$get']>[number];
export type IListedPage = InferResponseType<Client['pages']['$get']>[number];
export type IPublicListedSlide = InferResponseType<Client['slides']['public']['$get']>[number];
export type IListedSlide = InferResponseType<Client['slides']['$get']>[number];
export type ISlide = InferResponseType<Client['slides'][':id']['$get']>;
export type IUpsertPageInput = InferRequestType<Client['pages']['$post']>['json'];
