<script setup lang="ts">
import type { ToastVariant } from '~/composables/useToast';

const { _toasts } = useToast();

const temp = [
	{
		variant: 'success',
		id: 'a',
		text: 'I\'m a success sdkfjsldkf ksdlfj skjdflkdjfowei eworiuweoirj',
	},
	{
		variant: 'error',
		id: 'b',
		text: 'I\'m a error',
	},
	{
		variant: 'warning',
		id: 'c',
		text: 'I\'m a warning',
	},
	{
		variant: 'info',
		id: 'd',
		text: 'I\'m a info',
	},
];

type ClassRecord = Record<ToastVariant, string>;

const icon: ClassRecord = {
	success: 'i-solar-check-circle-linear text-green',
	error: 'i-solar-close-circle-linear text-red',
	warning: 'i-solar-danger-triangle-linear text-yellow-5 -mt-[2px]',
	info: 'i-solar-info-circle-linear text-sky',
};
const iconBackground: ClassRecord = {
	success: 'bg-green',
	error: 'bg-red',
	warning: 'bg-yellow',
	info: 'bg-sky',
};
</script>

<template>
	<div
		class="fixed right-2 top-2 z-100 max-h-screen max-w-[calc(100%_-_4rem)] w-64 flex flex-col gap-5 overflow-y-hidden pb-2"
		aria-hidden
	>
		<!-- <TransitionGroup> -->
		<!-- 	<div -->
		<!-- 		v-for="{ id, variant, text } in _toasts" -->
		<!-- 		:key="id" -->
		<!-- 		class="relative min-h-16 w-full flex gap-4 rounded bg-neutral-200 dark:bg-neutral-800" -->
		<!-- 	> -->
		<!-- 		<div class="h-8 w-8 rounded-1/2" :class="[iconBackground[variant]]"> -->
		<!-- 			<span :class="[icon[variant]]" /> -->
		<!-- 		</div> -->
		<!-- 		<p class="shrink-1"> -->
		<!-- 			I'm toast {{ variant }} {{ text }} -->
		<!-- 		</p> -->
		<!-- 	</div> -->
		<!-- </TransitionGroup> -->
		<div
			v-for="{ id, variant, text } in temp"
			:key="id"
			class="relative min-h-12 w-full flex shrink-0 items-center gap-3 rounded-md bg-neutral-200 p-2 shadow-md dark:bg-neutral-800"
		>
			<div class="h-8 w-8 flex-center shrink-0 rounded-1/2 bg-op-20" :class="[iconBackground[variant]]">
				<div class="h-6 w-6" :class="[icon[variant]]" />
			</div>
			I'm toast {{ variant }} {{ text }}
		</div>
	</div>
</template>
