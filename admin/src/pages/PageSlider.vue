<script setup lang="ts">
useGlobalPagesStylesheet();

const value = ref('');
const selectedId = ref<string>();
</script>

<template>
	<main class="grid grid-cols-1 mx-auto max-w-256 w-full gap-y-5 px-4 pb-4 pt-[1.125rem] lg:px-0">
		<div class="flex gap-3 pr-12 md:pr-0">
			<VCombobox
				id="slideSelect"
				v-model="selectedId"
				label="slide"
				:options="[1, 2, 3]"
				label-visually-hidden
				transform-options
				select-only
			/>
			<VButton class="ml-auto neon-amber">
				wyczyść
			</VButton>
			<VButton class="min-w-20 neon-green">
				{{ selectedId ? 'zapisz' : 'utwórz' }}
			</VButton>
		</div>
		<VEditor
			ref="editor"
			class="h-72 shadow"
			:models="[
				{ language: 'html', value },
			]"
			:current-model="0"
			@update:model-value="value = $event"
		/>

		<div v-html="value" />
	</main>
</template>
