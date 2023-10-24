<script setup lang="ts">
const isTiles = ref(true);
</script>

<template>
	<main id="content" class="flex flex-col gap-x-3 gap-y-5 pb-4 pt-[1.125rem]">
		<div class="mx-auto max-w-360 w-full flex justify-end gap-x-3">
			<VButton
				ref="saveButton"
				class="footer-controls-padding-right mr-12 h-fit md:mr-0 neon-green"
			>
				zapisz
			</VButton>
		</div>
		<div class="grid auto-rows-[9rem] grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] mx-auto max-w-360 w-full gap-x-5 gap-y-4 px-2 lg:px-8 md:px-[clamp(2rem,_-12.25rem_+_29.6875vw,_6.75rem)]">
			<div class="flex items-center border border-neutral rounded-md">
				dodaj folder/wgraj pliki
			</div>
			<div class="flex items-center border border-neutral rounded-md">
				dodaj folder/wgraj pliki
			</div>
			<div class="flex items-center border border-neutral rounded-md">
				dodaj folder/wgraj pliki
			</div>
		</div>
	</main>
</template>
