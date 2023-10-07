<script setup lang="ts">
withDefaults(
	defineProps<{
		status?: number;
		message?: string;
	}>(),
	{
		status: 500,
		message: 'something went wrong 😟',
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
		<RouterLink :to="backTarget" class="text-xl text-link">
			go back
		</RouterLink>
	</main>
</template>
