import type { MaybeRef } from 'vue';

export const useFilesLayoutClasses = (isTiles: MaybeRef<boolean>) => computed(() => {
	let child = 'grid grid-cols-2 gap-x-3 grid-rows-[subgrid] pb-4 gap-y-3 row-span-5 items-center';
	let image = 'w-full h-[clamp(7rem,_6.1579rem_+_4.2105vw,_9rem)] mb-1 col-span-full';
	let input = 'col-span-full self-start mx-3';
	const baseButton = 'mt-3 h-fit w-fit';
	let deleteButton = baseButton;
	let moveButton = baseButton;
	let restoreButton = baseButton;

	if (!toValue(isTiles)) {
		child += ' md:flex md:gap-3 md:pr-4 md:pb-0';
		image += ' md:h-20 md:w-20 md:mb-0';
		input += ' md:self-auto md:mx-0';
		deleteButton += ' md:ml-3 md:mt-auto md:mb-[0.625rem]';
		moveButton += ' md:mt-auto md:mb-[0.625rem]';
		restoreButton += ' md:ml-3 md:mt-auto md:mb-[0.625rem]';
	} else {
		deleteButton += ' mr-2';
		moveButton += ' -ml-2';
		restoreButton += ' mx-auto col-span-full';
	}

	return { child, image, input, deleteButton, moveButton, restoreButton };
});
