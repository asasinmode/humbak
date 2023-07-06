<script setup lang="ts">
import type { ToastVariant } from '~/composables/useToast';

const { _toasts, clearToast } = useToast();

type ClassRecord = Record<ToastVariant, string>;

const icon: ClassRecord = {
	success: 'i-solar-check-circle-linear text-green',
	error: 'i-solar-close-circle-linear text-red',
};
const iconBackground: ClassRecord = {
	success: 'bg-green',
	error: 'bg-red',
};
const containerProgress: ClassRecord = {
	success: 'after:bg-green',
	error: 'after:bg-red',
};
</script>

<template>
	<section
		class="fixed right-2 top-2 z-100 max-h-screen max-w-[calc(100%_-_4rem)] w-64 flex flex-col gap-3 overflow-y-hidden"
		:class="{ 'pb-2': _toasts.length }"
		aria-hidden
	>
		<TransitionGroup>
			<div
				v-for="{ id, variant, text } in _toasts"
				:key="id"
				class="toast-progress relative min-h-12 w-full flex shrink-0 items-center gap-3 overflow-hidden rounded-md bg-neutral-200 p-2 pb-3 hyphens-auto shadow-md after:absolute after:bottom-0 after:left-0 after:h-1 after:w-0 dark:bg-neutral-800 after:content-empty"
				:class="containerProgress[variant]"
			>
				<div class="h-8 w-8 flex-center shrink-0 rounded-1/2 bg-op-20" :class="iconBackground[variant]">
					<div class="h-6 w-6" :class="icon[variant]" />
				</div>
				{{ text }}
				<button
					class="absolute right-1 top-1 text-2 text-neutral w-5 h-5 i-mdi-close hover:text-neutral-500 dark:hover:text-neutral-300"
					tabindex="-1"
					@click="clearToast(id)" />
			</div>
		</TransitionGroup>
	</section>
</template>
