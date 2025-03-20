export function getPathWithoutExtension(path: string) {
	const pathDotIndex = path.lastIndexOf('.');
	return path.slice(0, pathDotIndex !== -1 ? pathDotIndex : undefined);
}
