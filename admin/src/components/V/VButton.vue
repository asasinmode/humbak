<script setup lang="ts">
defineProps<{
	loading?: boolean;
}>();
</script>

<template>
	<button class="temp relative px-3 py-1 shadow disabled:(border-op-50 bg-op-20) dark:disabled:border-op-80">
		<VLoading v-show="loading" class="absolute left-1/2 top-1/2 translate-center" />
		<span :class="{ 'op-0': loading }">
			<slot />
		</span>
	</button>
</template>
