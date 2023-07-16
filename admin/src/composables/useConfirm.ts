// @unocss-include
import VButton from '~/components/V/VButton.vue';
import VDialog from '~/components/V/VDialog.vue';

const promise = ref<Promise<boolean>>();
const resolve = ref<(value: boolean) => void>();

const title = ref('niezapisane zmiany');
const text = ref('Masz niezapisane zmiany. Czy na pewno chcesz kontynuować?');
const okText = ref('kontynuuj');

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
			classContainer: 'grid grid-cols-2 gap-x-2 gap-y-3',
			classCloseButton: 'justify-self-end',
		},
		{
			default: () => [
				h('h3', { class: 'col-span-full text-center text-5 font-600' }, title.value),
				h('p', { class: 'col-span-full mb-3' }, text.value),
			],
			post: () => h(
				VButton,
				{
					class: 'neon-green justify-self-start',
					onClick() {
						resolve.value?.(true);
						close.value?.();
					},
				},
				() => okText.value
			),
		}
	);
});

export const useConfirm = () => {
	function confirm(
		activatorElement?: HTMLElement | null,
		props: {
			title?: string;
			text?: string;
			okText?: string;
		} = {}
	) {
		activator.value = activatorElement;

		if (props.title) {
			title.value = props.title;
		}
		if (props.text) {
			text.value = props.text;
		}
		if (props.okText) {
			okText.value = props.okText;
		}

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
