<script setup lang="ts">
withDefaults(defineProps<{
	size?: string | number;
}>(), {
	size: 20,
});
</script>

<template>
	<div class="flex-center animate-duration-4500 text-black dark:text-white" aria-hidden="true">
		<div
			class="hourglass-loader after:(block rounded-full content-empty)"
			:style="`--size: ${size}px;`"
		/>
	</div>
</template>

<style>
.hourglass-loader:after {
	margin: calc(var(--size) / 10);
	border: calc(var(--size) / 10 * 4) solid currentColor;
	border-color: currentColor transparent currentColor transparent;
	animation: easedSpin 1.6s infinite;
}
@keyframes easedSpin {
	0% {
		transform: rotate(0);
		animation-timing-function: cubic-bezier(0.55, 0.055, 0.675, 0.19);
	}
	50% {
		transform: rotate(900deg);
		animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
	}
	100% {
		transform: rotate(1800deg);
	}
}
</style>
