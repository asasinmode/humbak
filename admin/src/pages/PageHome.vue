<script setup lang="ts">
</script>

<template>
	<main class="grid grid-cols-1 mx-auto max-w-7xl gap-x-4 gap-y-4 px-2 pt-4 lg:grid-cols-3 md:grid-cols-2 md:px-4 md:py-8">
		<div class="col-span-full mt-[2px] w-[calc(100%-_3.5rem)] flex gap-4 md:mx-auto md:max-w-128">
			<VInput id="pageSearch" class="w-0 flex-1" suffix-icon="i-fa6-solid-magnifying-glass" />
			<VButton class="neon-blue">
				szukaj
			</VButton>
		</div>

		<VInput id="pageTitle" label="tytuł strony" />
		<VInput id="pageSlug" label="url" />
		<VInput id="pageMenuText" label="tekst w menu" />
	</main>
</template>
