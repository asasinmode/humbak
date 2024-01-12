import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { env } from '../../env';

// todo building makes this path invalid, gotta go only 1 up
const dirname = fileURLToPath(new URL('../../..', import.meta.url));

export const filesStoragePath = join(dirname, env.FILES_PATH);

export const stylesheetsStoragePath = join(dirname, env.STYLESHEETS_PATH);
