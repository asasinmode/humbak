type ToastVariant = 'success' | 'error' | 'warning' | 'info';
type Toast = {
	id: string;
	variant: string;
	text: string;
};

const _toasts = ref<Toast[]>([]);

const toast = (text: string, variant: ToastVariant = 'success') => {
	console.log('toasting');
	// _toasts.value.unshift({
	// 	id: Math.random().toString(36).substring(2, 9),
	// 	text,
	// 	variant,
	// });

	// setTimeout(() => _toasts.value.pop(), 3000);
};

export const useToast = () => ({
	_toasts,
	toast,
});
