<script setup lang="ts">
const thing = {};
</script>

<template>
	<VDialog
		class="mt-2 h-8 w-8 p-0 neon-indigo"
		title="pliki"
		class-container="grid grid-cols-[1fr_1fr_min-content] gap-x-3"
		class-close-button="col-span-full mx-auto w-fit mt-3"
		close-button-text="zamknij"
	>
		<template #button>
			<span class="visually-hidden">pliki</span>
			<div class="i-fluent-image-24-regular group absolute left-1/2 top-1/2 h-5 w-5 translate-center" />
		</template>

		<h3 class="col-span-full text-center text-5 font-600 mb-3">
			pliki
		</h3>
	</VDialog>
</template>
