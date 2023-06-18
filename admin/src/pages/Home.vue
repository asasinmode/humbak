<script setup lang="ts">
</script>

<template>
	<main class="flex-center">
		<button
			class="dark:hoverable:(bg-white text-hex-121212) hoverable:(bg-hex-121212 text-white)"
		>
			home
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
