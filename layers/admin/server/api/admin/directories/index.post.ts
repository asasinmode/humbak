import fs from 'node:fs/promises';
import { eq } from 'drizzle-orm';
import { insertDirectorySchema } from '~~/server/db/schema/directories';

const { directories } = tables;

export default defineEventHandler(async (event) => {
	await adminOnly(event);

	const input = await useValidatedBody(event, insertDirectorySchema);
	const target = await getTargetDir(false, input.parentId);

	let targetDirPath = '/';
	if (target) {
		targetDirPath = `${target.path}/`;
	};
	const path = `${targetDirPath}${input.name}`;

	const [{ insertId }] = await db
		.insert(directories)
		.values({ ...input, path });

	await fs.mkdir(`${filesStoragePath}${path}`);

	const [result] = await db
		.select({
			id: directories.id,
			parentId: directories.parentId,
			name: directories.name,
		})
		.from(directories)
		.where(eq(directories.id, insertId))
		.orderBy(directories.name);

	return result!;
});
