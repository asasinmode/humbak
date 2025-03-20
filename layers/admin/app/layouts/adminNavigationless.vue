<!-- eslint-disable vue/no-multiple-template-root -->
<template>
	<AdminTheThemeToggle
		class="fixed left-2 top-[0.8125rem] filter-drop-shadow filter-drop-shadow-color-black/20 md:left-[clamp(0.25rem,-4.06rem_+_6.73vw,2rem)]"
	/>
	<slot />
	<AdminTheToasts />
</template>

<style>
@import url('../assets/admin.css');
</style>
