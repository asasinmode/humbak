import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { env } from '../../env';

const dirname = fileURLToPath(new URL('../../..', import.meta.url));
// temp replace when building, couldnt find any easy way
// const dirname = fileURLToPath(new URL('..', import.meta.url));

export const filesStoragePath = join(dirname, env.FILES_PATH);

export const stylesheetsStoragePath = join(dirname, env.STYLESHEETS_PATH);
