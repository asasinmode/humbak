// @unocss-include
import { AdminVButton, AdminVDialog } from '#components';

const promise = ref<Promise<boolean>>();
const resolve = ref<(value: boolean) => void>();

const title = ref('niezapisane zmiany');
const text = ref('Masz niezapisane zmiany. Czy na pewno chcesz kontynuować?');
const okText = ref('kontynuuj');

const close = ref(() => {});
const open = ref(() => {});
const activator = ref<HTMLElement>();
const component = defineComponent(() => {
	const dialog = ref<InstanceType<typeof AdminVDialog>>();

	onMounted(() => {
		if (dialog.value) {
			open.value = dialog.value.open;
			close.value = dialog.value.close;
		}
	});

	return () => h(
		AdminVDialog,
		{
			ref: dialog,
			disableClickOutside: true,
			noOpenButton: true,
			closeAction: () => resolve.value?.(false),
			activator: activator.value,
			classContainer: 'grid grid-cols-2 gap-x-2 gap-y-3',
			classCloseButton: 'justify-self-end',
		},
		{
			default: () => [
				h('h3', { class: 'col-span-full text-center text-5 font-600' }, title.value),
				h('p', { class: 'col-span-full mb-3' }, text.value),
			],
			post: () => h(
				AdminVButton,
				{
					class: 'neon-green justify-self-start',
					onClick() {
						resolve.value?.(true);
						close.value?.();
					},
				},
				() => okText.value,
			),
		},
	);
});

export function useConfirm() {
	function confirm(
		activatorElement?: HTMLElement,
		props: {
			title?: string;
			text?: string;
			okText?: string;
		} = {},
	) {
		activator.value = activatorElement;

		title.value = props.title ?? 'niezapisane zmiany';
		text.value = props.text ?? 'Masz niezapisane zmiany. Czy na pewno chcesz kontynuować?';
		okText.value = props.okText ?? 'kontynuuj';

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
		TheConfirm: component,
	};
}
