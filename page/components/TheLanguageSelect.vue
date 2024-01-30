<script setup lang="ts">
const props = defineProps<{
	languages: string[];
	language: string;
}>();

const isExpanded = ref(false);
const cursoredOverIndex = ref(props.languages.indexOf(props.language));

const listbox = ref<HTMLUListElement>();

watch(() => props.language, (value) => {
	cursoredOverIndex.value = 0;
	for (let i = 0; i < props.languages.length; i++) {
		if (props.languages[i] === value) {
			cursoredOverIndex.value = i;
			break;
		}
	}
});

function moveCursor(value: number) {
	if (!isExpanded.value) {
		isExpanded.value = true;
		return;
	}

	if (cursoredOverIndex.value === undefined) {
		cursoredOverIndex.value = value > 0 ? 0 : props.languages.length - 1;
	} else {
		cursoredOverIndex.value = (cursoredOverIndex.value + value) % props.languages.length;
		if (cursoredOverIndex.value < 0) {
			cursoredOverIndex.value = props.languages.length + cursoredOverIndex.value;
		}
	}
}

function closeIfFocusedOutside(event: FocusEvent) {
	const target = event.relatedTarget as HTMLElement | null;
	if (!target || !listbox.value || !listbox.value.contains(target)) {
		isExpanded.value = false;
	}
}

function confirmChoice() {
	selectOption(cursoredOverIndex.value);
	isExpanded.value = false;
}

function selectOption(index: number) {
	navigateTo(`/${props.languages[index]}`);
	isExpanded.value = false;
}

const activeDescendantId = computed(() => cursoredOverIndex.value !== undefined
	? `languageSelect-option-${cursoredOverIndex.value}`
	: '');
</script>

<template>
	<div
		class="relative col-start-2 cursor-pointer row-start-1 ml-2 my-2 hoverable:text-humbak-8 lg:(m-0 absolute right-0 hoverable:bg-humbak-5 hoverable:text-inherit z-10)"
		title="język"
		@mouseenter="isExpanded = true"
		@mouseleave="isExpanded = false"
	>
		<label id="languageSelectLabel" for="languageSelect" class="visually-hidden">
			język
		</label>
		<div
			id="languageSelect"
			tabindex="0"
			class="w-12 h-12 flex-center"
			aria-labelledby="languageSelectLabel"
			role="combobox"
			aria-haspopup="listbox"
			aria-controls="languageSelect-listbox"
			:aria-expanded="isExpanded"
			:aria-activedescendant="activeDescendantId"
			@focus="isExpanded = true"
			@focusout="closeIfFocusedOutside"
			@keydown.up.prevent="moveCursor(-1)"
			@keydown.down.prevent="moveCursor(1)"
			@keydown.esc.stop="isExpanded = false"
			@keydown.enter="confirmChoice"
			@click="isExpanded = true"
		>
			<span class="visually-hidden">
				{{ language }}
			</span>
			<div class="i-ph-translate-bold pointer-events-none w-6 h-6" aria-hidden="true" />
		</div>
		<ul
			v-show="isExpanded && languages.length"
			id="languageSelect-listbox"
			ref="listbox"
			class="absolute bottom-0 bg-humbak-5 left-1/2 z-10 w-12 translate-y-full of-hidden shadow-md -translate-x-1/2"
			role="listbox"
			tabindex="-1"
			aria-labelledby="languageSelectLabel"
			@keydown.up.prevent="moveCursor(-1)"
			@keydown.down.prevent="moveCursor(1)"
		>
			<li
				v-for="(option, index) in languages"
				:id="`languageSelect-option-${index}`"
				:key="option"
				class="select-none"
				:class="cursoredOverIndex === index ? 'bg-humbak-7' : ''"
				role="option"
				:aria-selected="language === option"
				@click="selectOption(index)"
				@mouseenter="cursoredOverIndex = index"
			>
				<NuxtLink class="w-12 h-12 flex flex-center truncate" :to="`/${option}`" tabindex="-1" @click.prevent="">
					{{ option }}
				</NuxtLink>
			</li>
		</ul>
	</div>
</template>
