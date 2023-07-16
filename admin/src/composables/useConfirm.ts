export const useConfirm = () => {
	const isOpen = ref(false);

	function open() {
		if (isOpen.value) {
			console.warn('tried to open confirm dialog while another one is already open');
			return false;
		}

		isOpen.value = true;
	}

	return {
		isOpen,
		open,
	};
};
