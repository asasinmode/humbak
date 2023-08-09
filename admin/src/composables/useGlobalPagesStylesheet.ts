import { ref } from 'vue';
import { env } from '~/env';

const { toast } = useToast();

const value = ref('');
const initValue = ref('');
const isLoading = ref(false);

const globalPagesStylesheet = document.createElement('style');
globalPagesStylesheet.id = 'globalPagesStylesheet';
document.head.appendChild(globalPagesStylesheet);

watch(value, (newValue) => {
	globalPagesStylesheet.innerHTML = newValue;
});

export const useGlobalPagesStylesheet = (valueFetchedCallback?: (value: string) => void) => {
	onMounted(async () => {
		isLoading.value = true;
		try {
			value.value = await fetch(`${env.VITE_API_URL}/public/stylesheets/global.css`).then(data => data.text());
			initValue.value = value.value;
			valueFetchedCallback && valueFetchedCallback(value.value);
		} catch (e) {
			toast('błąd przy ładowaniu globalnych stylów', 'error');
			console.error(e);
		} finally {
			isLoading.value = false;
		}
	});

	return {
		value,
		initValue,
		isLoading,
	};
};
