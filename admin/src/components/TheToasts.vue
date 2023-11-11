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
		name="toast"
		tag="section"
		class="pointer-events-none fixed bottom-0 right-0 top-2 z-102 box-content max-w-[calc(100%_-_4rem)] w-64 of-hidden pl-6 pr-2"
		aria-live="polite"
	>
		<div
			v-for="{ id, variant, text } in toasts"
			:key="id"
			class="toast-progress pointer-events-auto relative mb-3 min-h-12 w-64 flex items-center of-hidden rounded-md bg-neutral-200 pb-3 pl-12 pr-5 pt-2 hyphens-auto shadow-md after:(absolute bottom-0 left-0 h-1 w-full origin-left content-empty) before:(absolute left-2 top-1/2 h-8 w-8 rounded-1/2 -translate-y-1/2) dark:bg-neutral-800"
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
	animation: toast-progress-shrink 3000ms linear forwards;
}

@keyframes toast-progress-shrink {
	0% {
		transform: scaleX(1);
	}
	100% {
		transform: scaleX(0);
	}
}

.toast-move {
	transition: all 250ms ease;
}

.toast-enter-active, .toast-leave-active {
	animation-duration: 700ms;
	animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
	animation-direction: forwards;
}

.toast-enter-active {
	animation-name: toast-bounce-in;
}

.toast-leave-active {
	position: absolute !important;
	animation-name: toast-bounce-out;
}

@keyframes toast-bounce-in {
	from {
		opacity: 0;
		transform: translateX(200rem);
	}
	60% {
		opacity: 1;
		transform: translateX(-1.5rem);
	}
	75% {
		transform: translateX(0.625rem);
	}
	90% {
		transform: translateX(-0.25rem);
	}
	to {
		transform: none;
	}
}

@keyframes toast-bounce-out {
	20% {
		opacity: 1;
		transform: translateX(-1.25rem);
	}
	to {
		opacity: 0;
		transform: translateX(40rem);
	}
}
</style>
