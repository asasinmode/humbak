import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { env } from '../../env';

// todo building makes this path invalid, gotta go only 1 up
const dirname = fileURLToPath(new URL('../../..', import.meta.url));

const adminPublicPath = join(dirname, env.ADMIN_PUBLIC_PATH);

export const adminFilesPath = join(adminPublicPath, 'files');

export const adminStylesheetsPath = join(adminPublicPath, 'stylesheets');
