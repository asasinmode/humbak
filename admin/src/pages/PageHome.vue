<script setup lang="ts">
</script>

<template>
	<main class="grid grid-cols-2 gap-x-4 gap-y-4 px-4 pt-6">
		<VInput id="pageSearch" class="col-span-full mr-14" />
		<VButton class="justify-self-end">
			Szukaj
		</VButton>
		<VButton class="justify-self-start">
			Wyczyść
		</VButton>
		<VInput id="pageTitle" label="Tytuł strony" class="col-span-full" />
		<VInput id="pageSlug" label="Url" class="col-span-full" />
		<VInput id="pageMenuText" label="Text w menu" class="col-span-full" />
	</main>
</template>
