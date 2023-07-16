import VButton from '~/components/V/VButton.vue';
import VDialog from '~/components/V/VDialog.vue';

const promise = ref<Promise<boolean>>();
const resolve = ref<(value: boolean) => void>();

const close = ref(() => {});
const open = ref(() => {});
const activator = ref<HTMLElement | null>();
const component = defineComponent(() => {
	const dialog = ref<InstanceType<typeof VDialog> | null>();

	onMounted(() => {
		if (dialog.value) {
			open.value = dialog.value.open;
			close.value = dialog.value.close;
		}
	});

	return () => h(
		VDialog,
		{
			ref: dialog,
			disableClickOutside: true,
			noOpenButton: true,
			closeAction: () => resolve.value?.(false),
			activator: activator.value,
		},
		{
			default: () => [
				h('h3', {}, 'niezapisane zmiany'),
				h('p', {}, 'Masz niezapisane zmiany. Czy na pewno chcesz kontunuować?'),
			],
			post: () => h(
				VButton,
				{
					class: 'neon-green',
					onClick() {
						resolve.value?.(true);
						close.value?.();
					},
				},
				() => 'kontynuuj'
			),
		}
	);
});

export const useConfirm = () => {
	function confirm(activatorElement?: HTMLElement | null) {
		activator.value = activatorElement;

		promise.value = new Promise<boolean>((_resolve) => {
			open.value?.();
			resolve.value = (value: boolean) => {
				return _resolve(value);
			};
		}).finally(() => {
			promise.value = undefined;
		});

		return promise.value;
	}

	return {
		confirm,
		resolve,
		TheConfirm: component,
	};
};
