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

async function handleSlide({ id, content, isHidden, language }: ISlide) {
	if (language !== props.language) {
		return;
	}
	const slideIndex = slides.value.findIndex(slide => slide.id === id);

	if (isHidden) {
		if (slideIndex === -1) {
			return;
		}
		slides.value.splice(slideIndex, 1);
	}

	if (slideIndex === -1) {
		slides.value.push({ id, content });
	} else {
		slides.value[slideIndex] = { id, content };
	}
}

async function loadSlides(language: string) {
	isLoading.value = true;
	try {
		slides.value = await api.slides.listPublic.query(language);

		if (!container.value) {
			toastGenericError();
			throw new Error('slider container not found');
		}

		await nextTick();
		blazeSlider && blazeSlider.destroy();
		blazeSlider = new BlazeSlider(container.value, {
			all: {
				enableAutoplay: true,
				slidesToScroll: 1,
				slidesToShow: 1,
				transitionDuration: 300,
				autoplayInterval: 1000,
				loop: true,
			},
		});
	} catch (e) {
		toast('błąd przy ładowaniu sliedów', 'error');
		console.error(e);
	} finally {
		isLoading.value = false;
	}
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
			</div>
		</div>
	</article>
</template>
