<script setup lang="ts">
const props = defineProps<{
	languages: string[];
	language: string;
}>();

const isExpanded = ref(false);
const cursoredOverIndex = ref(props.languages.indexOf(props.language));

const listbox = ref<HTMLUListElement>();

watch(() => props.language, (value) => {
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

function expandAndSetCursoredOver() {
	for (let i = 0; i < props.languages.length; i++) {
		if (props.languages[i] === props.language) {
			cursoredOverIndex.value = i;
			break;
		}
	}
	isExpanded.value = true;
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
		class="relative col-start-2 row-start-1 my-2 ml-2 cursor-pointer lg:(absolute right-0 m-0 focus-within:bg-humbak-5 hover:bg-humbak-5)"
		:style="`--languages-count: ${languages.length}`"
		title="język"
		@mouseenter="expandAndSetCursoredOver"
		@mouseleave="isExpanded = false"
	>
		<label id="languageSelectLabel" for="languageSelect" class="sr-only">
			język
		</label>
		<div
			id="languageSelect"
			tabindex="0"
			class="relative z-1 h-12 w-12 flex-center bg-white before:(pointer-events-none fixed inset-x-0 right-[calc(50%_-_0.5rem)] h-12 bg-inherit content-empty -z-1) lg:(bg-inherit hoverable:text-inherit before:hidden) hoverable:text-humbak-8"
			aria-labelledby="languageSelectLabel"
			role="combobox"
			aria-haspopup="listbox"
			aria-controls="languageSelect-listbox"
			:aria-expanded="isExpanded"
			:aria-activedescendant="activeDescendantId"
			@focus="expandAndSetCursoredOver"
			@focusout="closeIfFocusedOutside"
			@keydown.up.prevent="moveCursor(-1)"
			@keydown.down.prevent="moveCursor(1)"
			@keydown.esc.stop="isExpanded = false"
			@keydown.enter="confirmChoice"
			@click="isExpanded = true"
		>
			<span class="sr-only">
				{{ language }}
			</span>
			<div class="i-ph-translate-bold pointer-events-none h-6 w-6" aria-hidden="true" />
		</div>
		<transition
			enter-from-class="-translate-x-[calc(3rem_*_(var(--languages-count)_-_1))]"
			enter-to-class="translate-x-12"
			leave-from-class="translate-x-12"
			leave-to-class="-translate-x-[calc(3rem_*_(var(--languages-count)_-_1))]"
			@after-enter="listbox?.classList.add('translate-x-12')"
			@before-leave="listbox?.classList.remove('translate-x-12')"
		>
			<ul
				v-show="isExpanded && languages.length"
				id="languageSelect-listbox"
				ref="listbox"
				class="absolute left-0 top-0 z-0 flex flex-row transition-transform lg:(bottom-0 left-1/2 top-auto z-10 block w-12 translate-y-full bg-humbak-5 shadow-md duration-0 transition-none -translate-x-1/2)"
				role="listbox"
				aria-orientation="vertical"
				tabindex="-1"
				aria-labelledby="languageSelectLabel"
				@keydown.up.prevent="moveCursor(-1)"
				@keydown.down.prevent="moveCursor(1)"
			>
				<li
					v-for="(option, index) in languages"
					:id="`languageSelect-option-${index}`"
					:key="option"
					class="select-none font-bold lg:font-400"
					:class="cursoredOverIndex === index ? 'text-humbak-8 bg-humbak/20 lg:(bg-humbak-7 text-black)' : 'text-black'"
					role="option"
					:aria-selected="language === option"
					@click="selectOption(index)"
					@mouseenter="cursoredOverIndex = index"
				>
					<NuxtLink class="h-12 w-12 flex flex-center truncate" :to="`/${option}`" tabindex="-1" @click.prevent="">
						{{ option }}
					</NuxtLink>
				</li>
			</ul>
		</transition>
	</div>
</template>
