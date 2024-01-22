<script setup lang="ts">
import { useIndexStore } from '~/store/index';

const { clickedIndexes, handleLetterClick } = useIndexStore();

const text = 'asasinmode';
</script>

<template>
	<main>
		<button
			v-for="(letter, index) in text" :key="index"
			class="dark:hoverable:(bg-white text-hex-121212) hoverable:(bg-hex-121212 text-white)"
			:class="{ 'underline': clickedIndexes.includes(index), '!text-indigo': clickedIndexes.length === text.length }"
			@click="handleLetterClick(index)"
		>
			{{ letter }}
		</button>
	</main>
</template>

<style scoped>
button {
	font-size: clamp(3.5rem, 12vw, 10rem);
	transition: background 0s, color 0s;
}
button:focus-visible{
	outline: none;
}
</style>
