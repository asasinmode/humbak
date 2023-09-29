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
const { toast } = useToast();

const isLoading = ref(true);
const slides = ref<IPublicListedSlide[]>([]);

onMounted(() => {
	console.log('i think i need to init slider here');
});

watch(() => props.language, (value) => {
	if (!value) {
		return;
	}
	loadSlides(value);
}, { immediate: true });

async function handleSlide({ id, content, isHidden, language }: ISlide) {
	if (language !== props.language || isHidden) {
		return;
	}

	const slideIndex = slides.value.findIndex(slide => slide.id === id);
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
