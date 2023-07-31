<script setup lang="ts">
const props = withDefaults(defineProps<{
	size?: number;
}>(), { size: 2 });

const { toggleTheme, isDark } = useTheme();

const element = ref<HTMLButtonElement | null>(null);
const style = computed(() => `--size: ${props.size}rem`);

defineExpose({
	element,
});
</script>

<template>
	<button
		ref="element"
		title="zmiana koloru"
		class="themeToggle"
		aria-live="polite"
		:style="style"
		@click="toggleTheme"
	>
		<span class="visually-hidden">zmiana koloru ({{ isDark ? 'ciemny' : 'jasny' }})</span>
		<svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24">
			<circle class="sun" cx="12" cy="12" r="6" mask="url(#moonMask)" fill="currentColor" />
			<g class="sunBeams" stroke="currentColor" stroke-width="2" stroke-linecap="round">
				<line x1="12" y1="1" x2="12" y2="3" />
				<line x1="12" y1="21" x2="12" y2="23" />
				<line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
				<line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
				<line x1="1" y1="12" x2="3" y2="12" />
				<line x1="21" y1="12" x2="23" y2="12" />
				<line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
				<line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
			</g>
			<mask id="moonMask" class="moon">
				<rect x="0" y="0" width="100%" height="100%" fill="white" />
				<circle cx="24" cy="10" r="6" fill="black" />
			</mask>
		</svg>
	</button>
</template>

<style>
.themeToggle{
	--size: 2rem;
	--duration: 200ms;
	--ease: cubic-bezier(.25, 0, .3, 1);
	--ease-out: cubic-bezier(0, 0, 0, 1);
	--ease-elastic-1: cubic-bezier(.5, 1.25, .75, 1.25);
	--ease-elastic-2: cubic-bezier(.5, 1.5, .75, 1.25);

	touch-action: manipulation;
	inline-size: var(--size);
	block-size: var(--size);
	aspect-ratio: 1;
	border-radius: 50%;
	opacity: 0.75;
}
.themeToggle svg {
	inline-size: 100%;
	block-size: 100%;
}
.themeToggle :is(.moon, .sun, .sunBeams) {
	transform-origin: center center;
}
.themeToggle .sunBeams {
	transition:
		transform var(--duration) var(--ease-elastic-2),
		opacity var(--duration) var(--ease);
}
.themeToggle .sun{
	transition: transform var(--duration) var(--ease-elastic-1);
}
.themeToggle .moon {
	transition-timing-function: linear;
}

.dark .themeToggle .sun{
	transform: scale(1.75);
	transition-timing-function: var(--ease);
	transition-duration: calc(var(--duration) / 2);
}
.dark .themeToggle .sunBeams {
	opacity: 0;
	transform: rotateZ(-25deg);
	transition-duration: 100ms;
}
.dark .themeToggle .moon circle{
	transform: translateX(-7px);
	transition: transform calc(var(--duration) / 2) var(--ease-out);
	transition-delay: calc(var(--duration) / 2);
	transition-duration: var(--duration);
}

.themeToggle:is(:hover, :focus-visible){
	opacity: 1;
}
</style>
