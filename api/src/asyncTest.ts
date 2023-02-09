export async function asyncTest() {
	await new Promise(resolve => setTimeout(resolve, 100));

	return 'awaited value';
}
