<script setup lang="ts">
const { TheConfirm } = useConfirm();
</script>

<!-- eslint-disable vue/no-multiple-template-root -->
<template>
	<AdminTheNavigation />
	<slot />
	<TheConfirm />
	<AdminTheToasts />
</template>

<style>
@import url('../assets/admin.css');
</style>
