<script setup lang="ts">
const props = defineProps<{
	id: number;
	modelValue: string;
	type: 'email' | 'phone';
	saveKey?: number;
}>();

const emit = defineEmits<{
	'update:model-value': [string];
	delete: [];
}>();

const localValue = ref(props.modelValue);

const isEditing = ref(false);
const inputRef = ref<HTMLInputElement>();
let deleteIfEmptyOnFocusOut = !props.modelValue;

!props.modelValue && edit();

function edit() {
	isEditing.value = true;
	nextTick(() => {
		inputRef.value?.focus();
	});
}

watch(() => props.saveKey, () => {
	deleteIfEmptyOnFocusOut = false;
});

function hideInput(updateValue: boolean) {
	if (!localValue.value) {
		if (deleteIfEmptyOnFocusOut) {
			emit('delete');
			return;
		}
		deleteIfEmptyOnFocusOut = false;
		localValue.value = props.modelValue;
	}

	isEditing.value = false;
	updateValue && emit('update:model-value', localValue.value);
	nextTick(() => document.getElementById(`footerRowExpandActions${props.type}${props.id}`)?.focus());
}
</script>

<template>
	<div class="relative">
		<template v-if="isEditing">
			<label class="visually-hidden" :for="`footer${type}${id}`">{{ modelValue || `nowy ${type === 'phone' ? 'telefon' : 'email'}` }}</label>
			<input
				:id="`footer${type}${id}`"
				ref="inputRef"
				v-model="localValue"
				class="absolute z-10 min-w-0 w-[calc(100%_+_clamp(2rem,_-2.5714rem_+_9.5238vw,_6rem))] border-2 border-neutral-5 rounded-full bg-white px-2 py-[0.125rem] -left-[0.625rem] -top-[0.25rem]"
				@focusout="hideInput(true)"
				@keydown.esc="hideInput(false)"
				@keydown.enter.prevent="hideInput(true)"
			>
		</template>
		<a
			v-if="type === 'email'"
			:href="`mailto:${modelValue}`"
			class="hoverable:underline"
			:class="isEditing ? 'op-0' : ''"
			:aria-hidden="isEditing"
			:tabindex="isEditing ? -1 : 0"
		>
			{{ modelValue }}
		</a>
		<p v-else>
			{{ modelValue }}
		</p>
		<FooterRowActionSelect
			v-if="!isEditing"
			class="top-1/2 translate-x-full !absolute -right-2 -translate-y-1/2"
			:index="id"
			:type="type"
			:title="modelValue"
			@edit="edit"
			@delete="$emit('delete')"
		/>
	</div>
</template>
