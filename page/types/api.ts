import type { InferResponseType, hc } from 'hono/client';
import type { AppType } from '@humbak/api/src';

type Client = ReturnType<typeof hc<AppType>>;

export type ISlide = InferResponseType<Client['public']['slides']['$get']>[number];
