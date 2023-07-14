<script setup lang="ts" generic="T extends Record<string, unknown>">
const props = defineProps<{
	rows: T[];
	total: number;
	rowKey: keyof T;
	keyLabels: Record<keyof T, string>;
	caption: string;
}>();

function getRowKey(row: T) {
	return `${row[props.rowKey]}`;
}
function getKeyLabel(key: keyof T) {
	return `${props.keyLabels[key]}`;
}
</script>

<template>
	<div class="overflow-auto" role="region" tabindex="0">
		<table class="v-table w-full" role="table">
			<caption class="text-start">
				{{ caption }} {{ total }}
			</caption>
			<tr class="" role="row">
				<th
					v-for="(label, key) in keyLabels"
					:key="key"
					class="text-start"
					role="columnheader"
				>
					{{ label }}
				</th>
			</tr>
			<tr
				v-for="row in rows"
				:key="getRowKey(row)"
				class=""
				role="row"
			>
				<td
					v-for="(value, key) in row"
					:key="key"
					:data-cell="getKeyLabel(key)"
					role="cell"
				>
					{{ value }}
				</td>
			</tr>
		</table>
	</div>
</template>

<style>
@media (max-width: 767px){
	.v-table th {
		display: none;
	}

	.v-table tr {
		display: block;
		padding-inline: 0.5rem;
		padding-block: clamp(0.50rem, calc(0.23rem + 1.34vw), 0.88rem);
	}

	.v-table td {
		display: grid;
		grid-template-columns: 6.25rem auto;
		gap: 1rem;
		font-weight: 700;
	}

	.v-table td::before {
		content: attr(data-cell) ":";
		font-weight: 400;
	}

	.v-table tr:nth-of-type(2n) {
		background-color: hsl(0 0% 0% / 0.1);
	}

	.dark .v-table tr:nth-of-type(2n) {
		background-color: hsl(0 0% 100% / 0.1);
	}
}
</style>
