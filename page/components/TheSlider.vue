<script setup lang="ts">
import 'blaze-slider/dist/blaze.css';
import BlazeSlider from 'blaze-slider';
import type { ISlide } from '~/types/api';

const props = defineProps<{
	slides: ISlide[];
	aspectRatio: string;
}>();

const container = ref<HTMLElement>();
let blazeSlider: BlazeSlider | undefined;

function resetSlider() {
	if (!container.value) {
		throw new Error('slider container not found');
	}

	blazeSlider && blazeSlider.destroy();
	if (!props.slides.length) {
		return;
	}

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

	for (const button of document.querySelector('.blaze-pagination')?.getElementsByTagName('button') || []) {
		button.setAttribute('tabindex', '-1');
	}
}

onMounted(() => {
	resetSlider();
});

onBeforeUnmount(() => {
	blazeSlider && blazeSlider.destroy();
});
</script>

<template>
	<article
		v-show="slides.length"
		class="relative w-full max-w-360 min-h-40 mx-auto lg:mt-8"
		:style="{ paddingTop: `min(860px, calc(${aspectRatio} * 100%))` }"
		aria-hidden="true"
		tabindex="-1"
	>
		<div ref="container" class="blaze-slider absolute inset-0">
			<div class="blaze-container h-full">
				<div class="blaze-track-container h-full">
					<div class="blaze-track h-full">
						<div v-for="slide in slides" :key="slide.id" class="h-full w-full relative" v-html="slide.content" />
					</div>
				</div>

				<button v-if="slides.length > 1" class="blaze-prev absolute left-0 top-0 hidden h-full flex-center px-2 md:flex hover:bg-white/10" tabindex="-1">
					<div class="i-fa6-solid:angle-left h-4 w-4 text-white" />
				</button>
				<div class="blaze-pagination absolute bottom-2 left-1/2 flex gap-3 -translate-x-1/2" />
				<button v-if="slides.length > 1" class="blaze-next absolute right-0 top-0 hidden h-full flex-center px-2 md:flex hover:bg-white/10" tabindex="-1">
					<div class="i-fa6-solid:angle-right h-4 w-4 text-white" />
				</button>
			</div>
		</div>
	</article>
</template>

<style>
.blaze-pagination button {
	@apply p-0 w-3 h-3 rounded-1/2 bg-neutral of-hidden transition-transform text-transparent
}
.blaze-pagination button.active {
	@apply bg-white scale-[1.2]
}
</style>
