<script setup lang="ts">
const { _toasts } = useToast();
const thing = ref();

console.log('toasts where', thing.value);
</script>

<template>
	<div ref="thing" class="fixed right-0 top-0 z-100 max-w-[calc(100%_-_4rem)] w-64 bg-sky-200">
		here go ur toasts
		<TransitionGroup>
			<div v-for="{ id, variant, text } in _toasts" :key="id">
				I'm toast {{ variant }} {{ text }}
			</div>
		</TransitionGroup>
	</div>
</template>
