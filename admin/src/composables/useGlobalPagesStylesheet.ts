import { type Ref, ref } from 'vue';
import { env } from '~/env';

const { toast } = useToast();

const value = ref('');
const initValue = ref('');

const globalPagesStylesheet = document.createElement('style');
document.head.appendChild(globalPagesStylesheet);

let updateTimeout: NodeJS.Timeout | undefined;

export function useGlobalPagesStylesheet(isLoading?: Ref<boolean>, valueFetchedCallback?: (value: string) => void) {
	onMounted(async () => {
		if (isLoading) {
			isLoading.value = true;
		}
		try {
			value.value = await fetch(`${env.VITE_PAGE_URL}/stylesheets/global.css`).then(data => data.text());
			initValue.value = value.value;
			globalPagesStylesheet.innerHTML = value.value;
			valueFetchedCallback && valueFetchedCallback(value.value);
		} catch (e) {
			toast('błąd przy ładowaniu globalnych stylów', 'error');
			console.error(e);
		} finally {
			if (isLoading) {
				isLoading.value = false;
			}
		}
	});

	onUnmounted(() => {
		globalPagesStylesheet.innerHTML = '';
	});

	return {
		value,
		initValue,
		isLoading,
		updateValue(newValue: string) {
			if (updateTimeout) {
				clearTimeout(updateTimeout);
			}
			updateTimeout = setTimeout(() => {
				globalPagesStylesheet.innerHTML = newValue;
			}, 500);
		},
	};
}
