import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { env } from '../env';

const dirname = fileURLToPath(new URL('../..', import.meta.url));

const adminPublicPath = join(dirname, env.ADMIN_PUBLIC_PATH);

export const adminFilesPath = `${adminPublicPath}/files`;

export const adminStylesheetsPath = `${adminPublicPath}/stylesheets`;