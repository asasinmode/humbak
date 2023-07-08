<script setup lang="ts">
import type { ToastVariant } from '~/composables/useToast';

const { toasts, clearToast } = useToast();

type ClassRecord = Record<ToastVariant, string>;

const icon: ClassRecord = {
	success: 'i-solar-check-circle-linear text-green',
	error: 'i-solar-close-circle-linear text-red',
};
const containerProgress: ClassRecord = {
	success: 'after:bg-green before:bg-green',
	error: 'after:bg-red before:bg-red',
};
</script>

<template>
	<TransitionGroup
		tag="section"
		class="fixed right-2 top-2 z-100 max-h-screen max-w-[calc(100%_-_4rem)] w-64 flex flex-col gap-3 overflow-y-hidden"
		:class="{ 'pb-2': toasts.length }"
		aria-hidden="true"
		name="toast"
	>
		<div
			v-for="{ id, variant, text } in toasts"
			:key="id"
			class="toast-progress relative min-h-12 w-full flex shrink-0 items-center overflow-hidden rounded-md bg-neutral-200 p-2 pb-3 pl-11 hyphens-auto shadow-md after:absolute before:absolute after:bottom-0 after:left-0 before:left-2 before:top-1/2 after:h-1 after:w-0 before:h-8 before:w-8 before:rounded-1/2 dark:bg-neutral-800 before:bg-op-20 after:content-empty before:content-empty before:-translate-y-1/2"
			:class="containerProgress[variant]"
		>
			<div class="absolute left-3 top-1/2 h-6 w-6 -translate-y-1/2" :class="icon[variant]" />
			{{ text }}
			<button
				class="i-mdi-close absolute right-1 top-1 h-5 w-5 text-2 text-neutral hover:text-neutral-500 dark:hover:text-neutral-300"
				tabindex="-1"
				@click="clearToast(id)"
			/>
		</div>
	</TransitionGroup>
</template>

<style>
.toast-progress:after {
	animation: shrink 2500ms linear;
}

@keyframes shrink {
	0% {width: 100%;}
	100% {width: 0;}
}

.toast-enter {

}
</style>
