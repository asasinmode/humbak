<script setup lang="ts">
withDefaults(
	defineProps<{
		status?: number;
		message?: string;
	}>(),
	{
		status: 500,
		message: 'coś poszło nie tak 😟',
	}
);

const backTarget: string = history.state.back ?? '/';
</script>

<template>
	<main id="content" class="flex-center flex-col gap-4 pt-14 lg:pt-24">
		<h1 class="text-6xl font-bold">
			{{ status }}
		</h1>
		<h2 class="text-center text-3xl">
			{{ message }}
		</h2>
		<RouterLink :to="backTarget" class="text-xl op-75 hoverable:(underline op-100)">
			wróć
		</RouterLink>
	</main>
</template>
