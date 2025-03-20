<script setup lang="ts">
import type { AdminTheThemeToggle } from '#components';
import type { ComponentPublicInstance } from 'vue';

const secondToLastFocusableNavElement = ref<InstanceType<typeof AdminTheThemeToggle>>();
const secondFocusableNavElement = ref<ComponentPublicInstance>();

const {
	isExpanded,
	toggleMenu,
	firstElementFocusIn,
	firstElementFocusOut,
	lastElementFocusIn,
	lastElementFocusOut,
} = useMobileMenu(
	768,
	() => secondFocusableNavElement.value?.$el,
	() => (secondToLastFocusableNavElement.value!.element as HTMLButtonElement),
);
</script>

<template>
	<button
		id="menuToggle"
		title="menu"
		class="fixed z-100 flex items-start justify-end bg-black md:hidden"
		:class="[
			isExpanded
				? 'bg-opacity-40 top-0 right-0 w-screen h-screen p-5 cursor-default is-expanded'
				: 'bg-opacity-0 top-3 right-3 w-12 h-12 p-2',
		]"
		@click="toggleMenu(!isExpanded)"
	>
		<span class="sr-only">menu</span>
		<div class="i-fa6-solid-bars h-8 w-8" />
	</button>

	<nav
		tabindex="-1"
		class="fixed z-102 grid grid-cols-2 mx-auto max-h-[calc(100vh_-_clamp(3rem,_-1rem_+_20vh,_8rem))] max-w-480 w-full justify-items-center gap-x-4 gap-y-2 of-auto bg-inherit py-2 transition-transform md:(relative flex translate-y-0 justify-around gap-x-0 bg-transparent px-[clamp(2.25rem,4.13rem_+_-3.91vw,1rem)] shadow-none)"
		:class="[isExpanded ? 'translate-y-0 shadow-md' : '-translate-y-full']"
	>
		<a
			id="skipContent"
			href="#content"
			class="fixed z-10 col-span-2 w-fit border border-black rounded-full bg-black px-3 py-1 text-5 text-white shadow transition-transform -translate-y-full focus-visible:translate-y-2 focus:translate-y-2 dark:(border-white bg-white text-black) md:(-translate-y-[calc(100%_+_5rem)] focus-visible:translate-y-0 focus:translate-y-0)"
			@click="toggleMenu(false)"
			@focusin="firstElementFocusIn"
			@focusout="firstElementFocusOut"
		>
			skip navigation
		</a>

		<NuxtLink
			ref="secondFocusableNavElement"
			to="/admin"
			class="col-span-2 w-fit px-3 py-1 text-5 shadow transition-margin neon-emerald"
			@click="toggleMenu(false)"
		>
			<div class="i-solar-document-text-linear mr-[0.125rem] inline-block align-sub text-emerald" />
			strony
		</NuxtLink>
		<NuxtLink
			to="/admin/menu"
			class="col-span-2 w-fit px-3 py-1 text-5 shadow neon-cyan"
			@click="toggleMenu(false)"
		>
			<div class="i-solar-layers-outline mr-[0.125rem] inline-block align-sub text-cyan" />
			menu
		</NuxtLink>
		<NuxtLink
			to="/admin/files"
			class="col-span-2 w-fit px-3 py-1 text-5 shadow neon-indigo"
			@click="toggleMenu(false)"
		>
			<div class="i-solar-folder-with-files-linear mr-[0.125rem] inline-block align-sub text-indigo dark:text-indigo-3" />
			pliki
		</NuxtLink>
		<NuxtLink
			to="/admin/global"
			class="col-span-2 w-fit px-3 py-1 text-5 shadow neon-violet"
			@click="toggleMenu(false)"
		>
			<div class="i-fa6-solid-earth-europe mr-[0.125rem] inline-block align-sub text-violet" />
			global
		</NuxtLink>
		<NuxtLink
			to="/admin/slider"
			class="col-span-2 w-fit px-3 py-1 text-5 shadow neon-fuchsia"
			@click="toggleMenu(false)"
		>
			<div class="i-solar-wallpaper-linear mr-[0.125rem] inline-block align-sub text-fuchsia" />
			slider
		</NuxtLink>
		<NuxtLink
			to="/admin/footer"
			class="col-span-2 w-fit px-3 py-1 text-5 shadow neon-orange"
			@click="toggleMenu(false)"
		>
			<div class="i-solar-smartphone-linear mr-[0.125rem] inline-block align-sub text-orange" />
			stopka
		</NuxtLink>

		<AdminTheThemeToggle
			ref="secondToLastFocusableNavElement"
			class="mt-2 justify-self-end filter-drop-shadow filter-drop-shadow-color-black/20 md:(absolute left-[clamp(0.25rem,_-2.75rem_+_6.25vw,_2.25rem)] top-1/2 mt-0 -translate-y-1/2)"
		/>
		<AdminTheSettings
			class="mt-2 justify-self-start filter-drop-shadow filter-drop-shadow-color-black/20 md:(absolute right-[clamp(0.25rem,_-2.75rem_+_6.25vw,_2.25rem)] top-1/2 mt-0 -translate-y-1/2)"
			@click="toggleMenu(false)"
			@focusin="lastElementFocusIn"
			@focusout="lastElementFocusOut"
		/>
	</nav>
</template>

<style>
#menuToggle {
	--nav-transition-duration: 150ms;

	transition:
		background var(--nav-transition-duration) ease,
		width 0ms ease var(--nav-transition-duration),
		height 0ms ease var(--nav-transition-duration),
		right 0ms ease var(--nav-transition-duration),
		top 0ms ease var(--nav-transition-duration),
		padding 0ms ease var(--nav-transition-duration);
}
#menuToggle.is-expanded {
	transition: background var(--nav-transition-duration) ease;
}

@media (max-width: 767px) {
	#skipContent:focus + a,
	#skipContent:focus-visible + a {
		margin-top: 3.125rem;
	}
}
</style>
