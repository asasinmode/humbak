import type { InferSelectModel } from 'drizzle-orm';
import { eq, isNull, sql } from 'drizzle-orm';
import * as v from 'valibot';
import { insertDirectorySchema } from '~~/server/db/schema/directories';
import { insertFileSchema } from '~~/server/db/schema/files';
import { nullablePositiveIntegerValidation, positiveIntegerValidation } from '~~/server/validation';

const { directories, files } = tables;

export const dirIdParamValidation = v.pipe(
	v.object({
		id: v.pipe(v.string(), v.custom((v) => {
			if (v === 'null') {
				return true;
			}
			if (Number.isNaN(Number.parseInt(v as string))) {
				return false;
			}
			return true;
		}, 'musi być liczbą lub null')),
	}),
	v.transform(({ id }) => ({
		id: id === 'null' ? null : Number.parseInt(id),
	})),
);

export const putDirectoryInput = v.object({
	deletedFileIds: v.array(positiveIntegerValidation),
	editedFiles: v.array(v.object({
		id: positiveIntegerValidation,
		name: insertFileSchema.entries.name,
		title: insertFileSchema.entries.title,
		alt: insertFileSchema.entries.alt,
		directoryId: nullablePositiveIntegerValidation,
	})),
	deletedDirIds: v.array(positiveIntegerValidation),
	editedDirs: v.array(v.object({
		id: positiveIntegerValidation,
		name: insertDirectorySchema.entries.name,
		parentId: nullablePositiveIntegerValidation,
	})),
});

export type IPutDirectoryInput = v.InferInput<typeof putDirectoryInput>;
export type IDir = Pick<InferSelectModel<typeof directories>, 'id' | 'name' | 'parentId' | 'path'>;

export async function getTargetDir(returnNotFound: boolean, id: number | null) {
	if (id === null) {
		return;
	}

	const [dir] = await db.select({
		path: directories.path,
	}).from(directories).where(eq(directories.id, id));

	if (!dir) {
		if (returnNotFound) {
			throw createError({
				statusCode: 404,
				statusMessage: 'Not Found',
			});
		} else {
			throw createError({
				statusCode: 400,
				statusMessage: 'Bad Request',
				data: { parentId: 'podany rodzic nie istnieje' },
			});
		}
	}

	return dir;
}

export async function dirData(id: number | null, returnAllDirs: boolean) {
	const [foundDirectories, foundFiles] = await Promise.all([
		db
			.select({
				id: directories.id,
				parentId: directories.parentId,
				name: directories.name,
			})
			.from(directories)
			.where(returnAllDirs
				? sql`1 = 1`
				: id === null ? isNull(directories.parentId) : eq(directories.parentId, id),
			)
			.orderBy(directories.name),
		db
			.select({
				id: files.id,
				directoryId: files.directoryId,
				path: files.path,
				name: files.name,
				title: files.title,
				alt: files.alt,
				mimetype: files.mimetype,
				width: files.width,
				height: files.height,
			})
			.from(files)
			.where(id === null ? isNull(files.directoryId) : eq(files.directoryId, id))
			.orderBy(files.name),
	]);

	return {
		directories: foundDirectories,
		files: foundFiles,
	};
}
