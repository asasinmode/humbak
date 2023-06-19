<script setup lang="ts">
const isExpanded = ref(false);

function onMenuToggle(isOpen: boolean) {
	isExpanded.value = isOpen;
}
</script>

<template>
	<button
		id="menu-toggle"
		title="menu"
		class="fixed z-10 flex items-start justify-end bg-black"
		:class="[
			isExpanded
				? 'bg-opacity-40 top-0 right-0 w-screen h-screen p-5 is-expanded'
				: 'bg-opacity-0 top-3 right-3 w-12 h-12 p-2',
		]"
		@click="onMenuToggle(!isExpanded)"
	>
		<div class="i-fa6-solid-bars h-8 w-8" />
	</button>

	<nav
		class="absolute z-11 grid grid-cols-2 max-h-[calc(100%_-_4rem)] w-full justify-items-center gap-x-4 gap-y-2 overflow-auto bg-indigo-100 py-2 transition-transform dark:bg-indigo-950"
		:class="[isExpanded ? 'translate-y-0 shadow-md' : '-translate-y-full']"
	>
		<RouterLink to="/strony" class="col-span-2 w-fit px-3 py-1 text-5 neon-button-cyan">
			strony
		</RouterLink>
		<RouterLink to="/pliki" class="col-span-2 w-fit px-3 py-1 text-5 neon-button-green">
			pliki
		</RouterLink>
		<RouterLink to="/css" class="col-span-2 w-fit px-3 py-1 text-5 neon-button-rose">
			css
		</RouterLink>
		<RouterLink to="/slider" class="col-span-2 w-fit px-3 py-1 text-5 neon-button-orange">
			slider
		</RouterLink>
		<RouterLink to="/stopka" class="col-span-2 w-fit px-3 py-1 text-5 neon-button-teal">
			stopka
		</RouterLink>

		<TheThemeToggle class="mt-3 justify-self-end" />
		<TheSettings class="mt-3 justify-self-start" />
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
