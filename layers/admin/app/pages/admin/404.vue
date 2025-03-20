<script setup lang="ts">
definePageMeta({ layout: 'admin-navigationless', noAuth: true });
useHead({ title: 'strona nieznaleziona - Admin' });

const backTarget: string = history.state.back?.startsWith('/admin') ? history.state.back : '/admin';
</script>

<template>
	<main id="content" class="flex-center flex-1 flex-col gap-4 pb-16 pt-14 lg:pt-24">
		<h1 class="text-6xl font-bold">
			404
		</h1>
		<h2 class="text-center text-3xl">
			strona nieznaleziona
		</h2>
		<NuxtLink :to="backTarget" class="text-xl op-75 hoverable:(underline op-100)">
			wróć
		</NuxtLink>
	</main>
</template>
