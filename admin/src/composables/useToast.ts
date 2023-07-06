export type ToastVariant = 'success' | 'error';
type Toast = {
	id: string;
	variant: ToastVariant;
	text: string;
};

const _toasts = ref<Toast[]>([]);
const timeouts: Record<string, NodeJS.Timeout> = {};

export const useToast = () => ({
	_toasts,
	toast(text: string, variant: ToastVariant = 'success') {
		const id = Math.random().toString(36).substring(2, 9);

		_toasts.value.push({
			id,
			text,
			variant,
		});
		timeouts[id] = setTimeout(() => _toasts.value.shift(), 2500);
	},
	clearToast(id: string) {
		const index = _toasts.value.findIndex(toast => toast.id === id);

		if (!timeouts[id] || index === -1) {
			return;
		}

		_toasts.value.splice(index, 1);
		clearTimeout(timeouts[id]);
	},
});
