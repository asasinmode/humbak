import type { InferResponseType, hc } from 'hono/client';
import type { AppType } from '@humbak/api/src';

type Client = ReturnType<typeof hc<AppType>>;

export type ILanguageResponse = InferResponseType<Client['public'][':language']['$get']>;

export type ISlide = ILanguageResponse['slides'][number];
export type IMenuLink = ILanguageResponse['menuLinks'][number];
