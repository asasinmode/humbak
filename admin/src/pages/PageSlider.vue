<script setup lang="ts">
const value = ref('');
const container = ref<HTMLDivElement>();

const { initResizeDrag } = useResizeHandler(container);
</script>

<template>
	<main class="mx-auto max-w-256 gap-x-3 gap-y-5 px-4 pb-4 pt-[3.625rem] lg:px-0 lg:pt-[1.125rem]">
		<section ref="container" class="relative min-h-[max(60vh,_16rem)] w-full flex">
			<VEditor
				ref="editor"
				class="flex-1 shadow"
				:models="[
					{ language: 'html', value },
				]"
				:current-model="0"
				@update:model-value="$event => value = $event"
			/>
			<VButton
				class="top-1/2 hidden h-8 w-8 translate-center cursor-move p-0 !absolute -right-4 md:flex neon-neutral"
				title="zmień rozmiar"
				@mousedown="initResizeDrag"
			>
				<span class="visually-hidden">zmień rozmiar</span>
				<div class="i-fa6-solid-arrows-up-down absolute left-1/2 top-1/2 h-4 w-4 translate-center" />
			</VButton>
		</section>
	</main>
</template>
