<script setup lang="ts">
import VDialog from '~/components/V/VDialog.vue';

const dialog = ref<InstanceType<typeof VDialog> | null>();

onMounted(() => {
	dialog.value?.open();
});
</script>

<template>
	<VDialog ref="dialog" disable-click-outside no-open-button>
		<h3>niezapisane zmiany</h3>
		<p>
			Masz niezapisane zmiany. Czy na pewno chcesz kontunuować?
		</p>

		<template #post>
			<VButton class="neon-green">
				kontunuuj
			</VButton>
		</template>
	</VDialog>
</template>
