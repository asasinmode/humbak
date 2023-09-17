<script setup lang="ts">
const value = ref('');
</script>

<template>
	<main class="grid grid-cols-1 mx-auto max-w-256 w-full gap-y-5 px-4 pb-4 pt-[1.125rem] lg:px-0">
		<VButton
			class="mr-12 justify-self-end md:mr-0 neon-green"
		>
			zapisz
		</VButton>
		<VEditor
			ref="editor"
			class="h-72 shadow"
			:models="[
				{ language: 'html', value },
			]"
			:current-model="0"
			@update:model-value="$event => value = $event"
		/>
	</main>
</template>
