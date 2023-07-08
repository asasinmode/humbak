export type ToastVariant = 'success' | 'error';
type Toast = {
	id: string;
	variant: ToastVariant;
	text: string;
};

const toasts = ref<Toast[]>([]);
const timeouts: Record<string, NodeJS.Timeout> = {};

export const useToast = () => ({
	toasts,
	toast: (text: string, variant: ToastVariant = 'success') => {
		const id = Math.random().toString(36).substring(2, 9);

		toasts.value.push({
			id,
			text,
			variant,
		});
		timeouts[id] = setTimeout(() => toasts.value.shift(), 3000);
	},
	clearToast: (id: string) => {
		const index = toasts.value.findIndex(toast => toast.id === id);

		if (!timeouts[id] || index === -1) {
			return;
		}

		toasts.value.splice(index, 1);
		clearTimeout(timeouts[id]);
	},
});
