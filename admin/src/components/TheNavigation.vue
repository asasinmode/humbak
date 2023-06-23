<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue';
import TheThemeToggle from '~/components/TheThemeToggle.vue';

const isExpanded = ref(false);
const firstFocusableNavElement = ref<ComponentPublicInstance | null>();
const secondToLastFocusableNavElement = ref<InstanceType<typeof TheThemeToggle> | null>();

function toggleMenu(isOpen: boolean) {
	isExpanded.value = isOpen;
}

function onToggleButtonFocusIn(event: FocusEvent) {
	if (event.relatedTarget === firstFocusableNavElement.value?.$el) {
		isExpanded.value = false;

		return;
	}

	if (event.relatedTarget !== null && event.relatedTarget !== document.documentElement) {
		return;
	}

	isExpanded.value = true;
}

function onToggleButtonFocusOut(event: FocusEvent) {
	if (event.relatedTarget === firstFocusableNavElement.value?.$el) {
		isExpanded.value = true;

		return;
	}

	if (event.relatedTarget !== null && event.relatedTarget !== document.documentElement) {
		return;
	}

	isExpanded.value = false;
}

function onLastElementFocusIn(event: FocusEvent) {
	if (window.innerWidth >= 768) {
		return;
	}

	if (event.relatedTarget === secondToLastFocusableNavElement.value?.buttonElement) {
		return;
	}

	isExpanded.value = true;
}

function onLastElementFocusOut(event: FocusEvent) {
	if (window.innerWidth >= 768) {
		return;
	}

	if (event.relatedTarget === secondToLastFocusableNavElement.value?.buttonElement) {
		return;
	}

	isExpanded.value = false;
}
</script>

<template>
	<button
		id="menu-toggle"
		title="menu"
		class="fixed z-10 flex items-start justify-end bg-black md:hidden"
		:class="[
			isExpanded
				? 'bg-opacity-40 top-0 right-0 w-screen h-screen p-5 cursor-default is-expanded'
				: 'bg-opacity-0 top-3 right-3 w-12 h-12 p-2',
		]"
		@click="toggleMenu(!isExpanded)"
		@focusin="onToggleButtonFocusIn"
		@focusout="onToggleButtonFocusOut"
	>
		<div class="i-fa6-solid-bars h-8 w-8" />
	</button>

	<nav
		class="absolute z-11 grid grid-cols-2 max-h-[calc(100%_-_4rem)] w-full justify-items-center gap-x-4 gap-y-2 overflow-auto bg-inherit py-2 transition-transform md:relative md:flex md:translate-y-0 md:justify-around"
		:class="[isExpanded ? 'translate-y-0 shadow-md' : '-translate-y-full']"
	>
		<RouterLink
			ref="firstFocusableNavElement"
			to="/" class="col-span-2 w-fit px-3 py-1 text-5 shadow neon-cyan"
			@click="toggleMenu(false)"
		>
			strony
		</RouterLink>
		<RouterLink
			to="/pliki"
			class="col-span-2 w-fit px-3 py-1 text-5 shadow neon-orange"
			@click="toggleMenu(false)"
		>
			pliki
		</RouterLink>
		<RouterLink
			to="/css"
			class="col-span-2 w-fit px-3 py-1 text-5 shadow neon-fuchsia"
			@click="toggleMenu(false)"
		>
			css
		</RouterLink>
		<RouterLink
			to="/slider"
			class="col-span-2 w-fit px-3 py-1 text-5 shadow neon-emerald"
			@click="toggleMenu(false)"
		>
			slider
		</RouterLink>
		<RouterLink
			to="/stopka"
			class="col-span-2 w-fit px-3 py-1 text-5 shadow neon-yellow"
			@click="toggleMenu(false)"
		>
			stopka
		</RouterLink>

		<TheThemeToggle
			ref="secondToLastFocusableNavElement"
			class="mt-2 justify-self-end filter-drop-shadow filter-drop-shadow-color-black/20 md:absolute md:left-[clamp(0.25rem,calc(-0.93rem_+_2.46vw),3.00rem)] md:top-1/2 md:mt-0 md:-translate-y-1/2"
		/>
		<TheSettings
			class="mt-2 justify-self-start filter-drop-shadow filter-drop-shadow-color-black/20 md:absolute md:right-[clamp(0.25rem,calc(-0.93rem_+_2.46vw),3.00rem)] md:top-1/2 md:mt-0 md:-translate-y-1/2"
			@click="toggleMenu(false)"
			@focusin="onLastElementFocusIn"
			@focusout="onLastElementFocusOut"
		/>
	</nav>
</template>

<style>
#menu-toggle {
	--nav-transition-duration: 150ms;

	transition: background var(--nav-transition-duration) ease,
		width 0ms ease var(--nav-transition-duration),
		height 0ms ease var(--nav-transition-duration),
		right 0ms ease var(--nav-transition-duration),
		top 0ms ease var(--nav-transition-duration),
		padding 0ms ease var(--nav-transition-duration);
}
#menu-toggle.is-expanded {
	transition: background var(--nav-transition-duration) ease;
}
</style>
