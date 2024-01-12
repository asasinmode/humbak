import { inArray } from 'drizzle-orm';
import { db } from 'src/db';
import { files } from 'src/db/schema/files';
import { directories } from 'src/db/schema/directories';
import type { IDir, IPutDirectoryInput } from 'src/routes/directories';
import type { IOriginalFile } from 'src/helpers/files/fileEditValidation';

export function createAllDirs(dirs: { parentId: number | null; path?: string; }[]) {
	const allDirs = new Map<number, IDir>();
	const allDirsArray: IDir[] = [];

	for (let i = 0; i < dirs.length; i++) {
		const id = i + 1;
		const tmp = dirs[i];
		const dir = {
			id,
			parentId: tmp.parentId,
			name: `${id}`,
			path: tmp.path ?? `/${id}`,
		};

		allDirs.set(id, dir);
		allDirsArray.push(dir);
	}

	return { allDirs, allDirsArray };
}

export function createOriginalFiles(files: { directoryId: number | null; name?: string; }[]) {
	const rv = new Map<number, IOriginalFile>();

	for (let i = 0; i < files.length; i++) {
		const id = i + 1;
		const tmp = files[i];
		const file = {
			id,
			directoryId: tmp.directoryId,
			path: `/${id}`,
			name: tmp.name ?? `${id}`,
		};
		rv.set(id, file);
	}

	return rv;
}

export function createInputFile(
	id: number,
	directoryId: number | null,
	name?: string
): IPutDirectoryInput['editedFiles'][number] {
	return {
		id,
		directoryId,
		name: name ?? `${id}`,
		title: `${id}`,
		alt: `${id}`,
	};
}

export function createFiles(
	files: {
		directoryId: number | null;
		path?: string;
		name?: string;
		title?: string;
		alt?: string;
		mimetype?: string;
	}[]
) {
	return files.map((f, i) => ({
		directoryId: f.directoryId,
		path: f.path ?? `/${i}`,
		name: f.name ?? `${i}`,
		title: f.title ?? `${i}`,
		alt: f.alt ?? `${i}`,
		mimetype: f.mimetype ?? `text/plain`,
	}));
}

export function createDirectories(dirs: { parentId: number | null; path?: string; name?: string; }[]) {
	return dirs.map((d, i) => ({
		parentId: d.parentId,
		path: d.path ?? `/${i}`,
		name: d.name ?? `${i}`,
	}));
}

export async function getCreatedFiles({
	fileInsertId,
	fileCount,
	dirInsertId: directoryInsertId,
	dirCount: directoryCount,
}: {
	fileInsertId: number;
	fileCount: number;
	dirInsertId: number;
	dirCount: number;
}) {
	const createdDirIds = Array.from({ length: directoryCount }, (_, i) => i + directoryInsertId);
	const createdDirs: IDir[] = await db.select({
		id: directories.id,
		parentId: directories.parentId,
		name: directories.name,
		path: directories.path,
	})
		.from(directories)
		.where(inArray(files.id, createdDirIds));

	const createdFileIds = Array.from({ length: fileCount }, (_, i) => i + fileInsertId);
	const createdFiles: IOriginalFile[] = await db.select({
		id: files.id,
		directoryId: files.directoryId,
		path: files.path,
		name: files.name,
	})
		.from(files)
		.where(inArray(files.id, createdFileIds));

	return {
		createdDirs: new Map(createdDirs.map(d => [d.id, d])),
		createdDirIds,
		createdFiles: new Map(createdFiles.map(f => [f.id, f])),
		createdFileIds,
	};
}
