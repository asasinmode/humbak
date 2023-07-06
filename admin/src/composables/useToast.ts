export type ToastVariant = 'success' | 'error';
type Toast = {
	id: string;
	variant: ToastVariant;
	text: string;
};

const _toasts = ref<Toast[]>([]);

const toast = (text: string, variant: ToastVariant = 'success') => {
	_toasts.value.push({
		id: Math.random().toString(36).substring(2, 9),
		text,
		variant,
	});

	setTimeout(() => _toasts.value.shift(), 2500);
};

export const useToast = () => ({
	_toasts,
	toast,
});
