<script setup lang="ts">
const title = ref('');
const slug = ref('');
const menuText = ref('');
const html = ref('');

async function save() {
	const thing = await useApi.pages.create.mutate({
		title: title.value,
		slug: slug.value,
		menuText: menuText.value,
		language: 'pl',
	});

	console.log('thing', thing);
}
</script>

<template>
	<section class="grid grid-cols-1 mx-auto max-w-7xl gap-x-4 gap-y-4 px-2 py-4 md:grid-cols-3 md:px-4 md:py-8">
		<div class="col-span-full mt-[2px] w-[calc(100%-_3.5rem)] flex gap-4 md:mx-auto md:max-w-128">
			<VInput id="pageSearch" class="w-0 flex-1" suffix-icon="i-solar-magnifer-linear" />
			<VButton class="neon-blue">
				szukaj
			</VButton>
		</div>

		<VInput id="pageTitle" v-model="title" label="tytuł strony" />
		<VInput id="pageSlug" v-model="slug" label="url" />
		<VInput id="pageMenuText" v-model="menuText" label="tekst w menu" />
	</section>

	<!-- @TODO make resizable with handle in the middle -->
	<section class="hidden h-[60vh] resize-y gap-5 overflow-hidden md:flex">
		<VEditor v-model="html" class="flex-1" />
		<main class="bg-checker flex-1" />
	</section>

	<section class="mt-4 flex justify-center gap-4 pb-4 md:mt-8">
		<VButton class="-ml-[0.8rem] neon-red">
			wyczyść
		</VButton>
		<VButton class="neon-green" @click="save">
			zapisz
		</VButton>
	</section>
</template>
