<script setup lang="ts">
const isTiles = ref(true);
</script>

<template>
	<main id="content" class="flex flex-col gap-x-3 gap-y-5 pb-4 pt-[1.125rem]">
		<div class="px-container mx-auto max-w-360 w-full flex justify-end gap-x-3 md:px-0">
			<VButton class="h-9 w-9 neon-blue" title="widok plików: kafelki" @click="isTiles = true">
				<span class="visually-hidden">widok plików: kafelki</span>
				<div class="i-fluent-grid-20-regular absolute left-1/2 top-1/2 h-[1.125rem] w-[1.125rem] translate-center" />
			</VButton>

			<VButton class="h-9 w-9 -ml-1 neon-blue" title="widok plików: lista" @click="isTiles = false">
				<span class="visually-hidden">widok plików: lista</span>
				<div class="i-fluent-text-bullet-list-20-filled absolute left-1/2 top-1/2 h-[1.375rem] w-[1.375rem] translate-center" />
			</VButton>

			<VButton
				ref="saveButton"
				class="md:mr-container mr-12 h-fit neon-green"
			>
				zapisz
			</VButton>
		</div>
		<div class="px-container grid auto-rows-[9rem] grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] mx-auto max-w-360 w-full gap-x-5 gap-y-4">
			<div class="flex items-center border border-2 border-neutral rounded-lg">
				dodaj folder/wgraj pliki
			</div>
			<div class="flex items-center border border-2 border-neutral rounded-lg">
				dodaj folder/wgraj pliki
			</div>
			<div class="flex items-center border border-2 border-neutral rounded-lg">
				dodaj folder/wgraj pliki
			</div>
		</div>
	</main>
</template>
