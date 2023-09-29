<script setup lang="ts">
import type { IPublicListedSlide } from '~/composables/useApi';

const props = defineProps<{
	language?: string;
	aspectRatio?: string;
}>();

const isLoading = ref(true);
const slides = ref<IPublicListedSlide[]>([]);

onMounted(() => {
	console.log('if', props.language, 'and', props.aspectRatio, 'then fetch, otherwise stay loading');
});

async function handleSlide(id: number, content: string) {
	const slideIndex = slides.value.findIndex(slide => slide.id === id);

	if (slideIndex === -1) {
		console.log('new slide, pushing', { id, content });
		return;
	}

	console.log('changing existing slide', { id, content });
}

async function loadSlies() {
	console.log('loading slides for', props.language, 'with', props.aspectRatio);
}

defineExpose({
	handleSlide,
});
</script>

<template>
	<article
		class="relative w-full"
		:style="{ paddingTop: `calc(${aspectRatio} * 100%)` }"
		aria-hidden
		tabindex="-1"
	>
		<div ref="container" class="absolute inset-0" />
	</article>
</template>
