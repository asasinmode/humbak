<script setup lang="ts" generic="T extends Record<string, unknown>">
const props = defineProps<{
	rows: T[];
	total: number;
	rowKey: keyof T;
}>();

function getRowKey(row: T) {
	return `${row[props.rowKey]}`;
}
</script>

<template>
	<table class="v-table w-full">
		<caption class="text-start">
			strony {{ total }}
		</caption>
		<tr>
			<th class="p-4 text-start">
				id
			</th>
			<th class="p-4 text-start">
				tytuł
			</th>
			<th class="p-4 text-start">
				tekst w m
			</th>
			<th class="p-4 text-start">
				język
			</th>
		</tr>
		<tr v-for="row in rows" :key="getRowKey(row)">
			<td v-for="(value, key) in row" :key="key" class="p-4">
				{{ key }}: {{ value }}
			</td>
		</tr>
	</table>
</template>

<style>
@media (max-width: 767px){
	.v-table th {
		display: none;
	}

	.v-table td {
		display: block;
	}
}
</style>
