import { eq, inArray } from 'drizzle-orm';

const { directories, files, contents, slides } = tables;

export default defineEventHandler(async (event) => {
	await adminOnly(event);

	const input = await useValidatedBody(event, putDirectoryInput);

	const allDirsArray: IDir[] = await db.select({
		path: directories.path,
		id: directories.id,
		name: directories.name,
		parentId: directories.parentId,
	}).from(directories);
	const allDirs: Map<number, IDir> = new Map(allDirsArray.map(d => [d.id, d]));

	const dirsToDelete = getDirsToDelete(input.deletedDirIds, allDirs, allDirsArray);
	const { dirsToEdit, errors: editedDirsErrors } = await getDirsToEdit(
		input.editedDirs,
		allDirs,
		allDirsArray,
		dirsToDelete,
	);

	const originalFilesArray: IOriginalFile[] = input.editedFiles.length
		? await db
			.select({
				id: files.id,
				directoryId: files.directoryId,
				path: files.path,
				name: files.name,
				mimetype: files.mimetype,
			})
			.from(files)
			.where(inArray(files.id, input.editedFiles.map(f => f.id)))
		: [];
	const originalFiles = new Map(originalFilesArray.map(f => [f.id, f]));

	const { filesToEdit, errors: editedFilesErrors } = await getFilesToEdit(
		input.editedFiles,
		allDirs,
		input.deletedFileIds,
		originalFiles,
	);

	const anyDirErrors = Object.keys(editedDirsErrors).length;
	const anyFileErrors = Object.keys(editedFilesErrors).length;
	if (anyDirErrors || anyFileErrors) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Bad Request',
			data: {
				editedDirs: anyDirErrors ? editedDirsErrors : undefined,
				editedFiles: anyFileErrors ? editedFilesErrors : undefined,
			},
		});
	}

	const modifiedPagesIds = new Set<number>();
	const modifiedSlidesIds = new Set<number>();

	await processDeletedFiles(input.deletedFileIds, modifiedPagesIds, modifiedSlidesIds);
	await processEditedFiles(filesToEdit, modifiedPagesIds, modifiedSlidesIds);
	await processDeletedDirs(dirsToDelete, allDirs, allDirsArray, modifiedPagesIds, modifiedSlidesIds);
	await processEditedDirs(dirsToEdit, allDirs, allDirsArray, modifiedPagesIds, modifiedSlidesIds);

	if (modifiedPagesIds.size) {
		const contentsToUpdate = await db
			.selectDistinct({
				pageId: contents.pageId,
				rawHtml: contents.rawHtml,
			})
			.from(contents)
			.where(inArray(contents.pageId, Array.from(modifiedPagesIds)));
		for (const { pageId, rawHtml } of contentsToUpdate) {
			const { value } = await parseHumbakHtml(rawHtml, db);
			await db.update(contents).set({ parsedHtml: value }).where(eq(contents.pageId, pageId));
		}
	}

	if (modifiedSlidesIds.size) {
		const contentsToUpdate = await db
			.selectDistinct({
				id: slides.id,
				rawContent: slides.rawContent,
			})
			.from(slides)
			.where(inArray(slides.id, Array.from(modifiedSlidesIds)));
		for (const { id, rawContent } of contentsToUpdate) {
			const { value } = await parseHumbakHtml(rawContent, db);
			await db.update(slides).set({ parsedContent: value }).where(eq(slides.id, id));
		}
	}

	const returnDirHeader = getRequestHeader(event, 'x-humbak-return-for-dir') || '';
	const parseResult = Number.parseInt(returnDirHeader);
	const returnForDirId = returnDirHeader === 'null'
		? null
		: !Number.isNaN(parseResult)
				? parseResult
				: undefined;
	if (returnForDirId !== undefined) {
		return await dirData(returnForDirId, true);
	}

	setResponseStatus(event, 204, 'No Content');
});
