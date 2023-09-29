<script setup lang="ts">
import 'blaze-slider/dist/blaze.css';
import BlazeSlider from 'blaze-slider';

import type { IPublicListedSlide, ISlide } from '~/composables/useApi';

const props = withDefaults(defineProps<{
	language?: string;
	aspectRatio?: string;
}>(), {
	aspectRatio: '1 / 2',
});

const api = useApi();
const { toast, toastGenericError } = useToast();

const isLoading = ref(true);
const container = ref<HTMLElement>();
const slides = ref<IPublicListedSlide[]>([]);
let blazeSlider: BlazeSlider | undefined;

onBeforeUnmount(() => {
	blazeSlider && blazeSlider.destroy();
});

watch(() => props.language, (value) => {
	if (!value) {
		return;
	}
	loadSlides(value);
}, { immediate: true });

function handleSlide({ id, content, isHidden, language }: ISlide) {
	if (language !== props.language) {
		return;
	}
	const slideIndex = slides.value.findIndex(slide => slide.id === id);
	let hasToResetSlider = false;

	if (isHidden) {
		if (slideIndex === -1) {
			return;
		}
		slides.value.splice(slideIndex, 1);
		hasToResetSlider = true;
	}

	if (slideIndex === -1) {
		slides.value.push({ id, content });
		hasToResetSlider = true;
	} else {
		slides.value[slideIndex] = { id, content };
	}

	hasToResetSlider && nextTick(() => resetSlider());
}

async function loadSlides(language: string) {
	isLoading.value = true;
	try {
		slides.value = await api.slides.listPublic.query(language);

		await nextTick();
		resetSlider();
	} catch (e) {
		toast('błąd przy ładowaniu sliedów', 'error');
		console.error(e);
	} finally {
		isLoading.value = false;
	}
}

function resetSlider() {
	if (!container.value) {
		toastGenericError();
		throw new Error('slider container not found');
	}

	blazeSlider && blazeSlider.destroy();
	blazeSlider = new BlazeSlider(container.value, {
		all: {
			enableAutoplay: true,
			slidesToScroll: 1,
			slidesToShow: 1,
			transitionDuration: 300,
			autoplayInterval: 6000,
			loop: true,
			slideGap: '0px',
		},
	});
}

defineExpose({
	handleSlide,
});
</script>

<template>
	<article
		class="relative w-full"
		:style="{ paddingTop: `calc(${aspectRatio} * 100%)` }"
		aria-hidden="true"
		tabindex="-1"
	>
		<VLoading v-if="isLoading" class="absolute inset-0" />
		<div ref="container" class="blaze-slider absolute inset-0">
			<div class="blaze-container h-full">
				<div class="blaze-track-container h-full">
					<div class="blaze-track h-full">
						<div v-for="slide in slides" :key="slide.id" class="h-full w-full" v-html="slide.content" />
					</div>
				</div>

				<button class="blaze-prev absolute left-0 top-0 hidden h-full flex-center px-2 md:flex hover:bg-white/10" tabindex="-1">
					<div class="i-fa6-solid:angle-left h-4 w-4 text-white" />
				</button>
				<div class="blaze-pagination absolute bottom-2 left-1/2 flex gap-3 -translate-x-1/2" />
				<button class="blaze-next absolute right-0 top-0 hidden h-full flex-center px-2 md:flex hover:bg-white/10" tabindex="-1">
					<div class="i-fa6-solid:angle-right h-4 w-4 text-white" />
				</button>
			</div>
		</div>
	</article>
</template>

<style>
.blaze-pagination button {
	@apply p-0 w-3 h-3 rounded-[50%] bg-neutral of-hidden transition-transform text-transparent
}
.blaze-pagination button.active {
	@apply bg-white scale-[1.2]
}
</style>
