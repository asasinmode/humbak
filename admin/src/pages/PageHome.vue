<script setup lang="ts">
</script>

<template>
	<section class="grid grid-cols-1 mx-auto max-w-7xl gap-x-4 gap-y-4 px-2 py-4 md:grid-cols-3 md:px-4 md:py-8">
		<div class="col-span-full mt-[2px] w-[calc(100%-_3.5rem)] flex gap-4 md:mx-auto md:max-w-128">
			<VInput id="pageSearch" class="w-0 flex-1" suffix-icon="i-fa6-solid-magnifying-glass" />
			<VButton class="neon-blue">
				szukaj
			</VButton>
		</div>

		<VInput id="pageTitle" label="tytuł strony" />
		<VInput id="pageSlug" label="url" />
		<VInput id="pageMenuText" label="tekst w menu" />
	</section>

	<section class="h-[60vh] flex resize-y gap-5 overflow-hidden">
		<VEditor class="flex-1" />
		<main class="bg-checker flex-1" />
	</section>

	<section class="mt-4 flex justify-center gap-4 pb-4 md:mt-8">
		<VButton class="-ml-[0.8rem] neon-red">
			wyczyść
		</VButton>
		<VButton class="neon-green">
			zapisz
		</VButton>
	</section>
</template>
