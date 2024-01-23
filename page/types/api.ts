import type { InferResponseType, hc } from 'hono/client';
import type { AppType } from '@humbak/api/src';

type Client = ReturnType<typeof hc<AppType>>;

// had to do it like that because types from public route for it are any
type IFooterContents = Omit<InferResponseType<Client['footerContents']['$get']>, 'language'>;
export type ILanguagePageData = Omit<InferResponseType<Client['public'][':language']['$get']>, 'footerContents'>
	& { footerContents: IFooterContents; };

export type ISlide = ILanguagePageData['slides'][number];
export type IMenuLink = ILanguagePageData['menuLinks'][number];
