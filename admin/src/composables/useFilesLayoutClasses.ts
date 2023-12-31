// @unocss-include
import type { MaybeRef } from 'vue';

export function useFilesLayoutClasses(isTiles: MaybeRef<boolean>) {
	return computed(() => {
		let child = 'grid grid-cols-2 gap-x-3 grid-rows-subgrid pb-4 gap-y-3 row-span-5 items-center';
		let image = 'w-full h-[clamp(7rem,_6.1579rem_+_4.2105vw,_9rem)] col-span-full';
		let input = 'col-span-full self-start mx-3';
		const baseButton = 'mt-3 h-fit w-fit';
		let deleteButton = baseButton;
		let moveButton = baseButton;
		let restoreButton = baseButton;
		let goToDirButton = 'col-span-full row-span-2 mx-3 self-start';

		if (toValue(isTiles)) {
			deleteButton += ' mr-2';
			moveButton += ' -ml-2';
			restoreButton += ' mx-auto col-span-full';
			goToDirButton += ' md:mt-[1.625rem]';
		} else {
			child += ' md:flex md:gap-3 md:pr-4 md:pb-0 after:-translate-y-1/2';
			image += ' md:h-20 md:w-20';
			input += ' md:self-auto md:mx-0';
			deleteButton += ' md:ml-3 md:mt-auto md:mb-[0.625rem]';
			moveButton += ' md:mt-auto md:mb-[0.625rem]';
			restoreButton += ' mx-auto col-span-full md:ml-3 md:mt-auto md:mb-[0.625rem]';
			goToDirButton += ' md:mt-auto md:mb-[0.625rem] md:mx-0';
		}

		return { child, image, input, deleteButton, moveButton, restoreButton, goToDirButton };
	});
}
