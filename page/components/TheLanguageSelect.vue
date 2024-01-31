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
		class="relative col-start-2 cursor-pointer row-start-1 ml-2 my-2 lg:(m-0 absolute right-0 hover:bg-humbak-5 focus-within:bg-humbak-5)"
		:style="`--languages-count: ${languages.length}`"
		title="język"
		@mouseenter="expandAndSetCursoredOver"
		@mouseleave="isExpanded = false"
	>
		<label id="languageSelectLabel" for="languageSelect" class="visually-hidden">
			język
		</label>
		<div
			id="languageSelect"
			tabindex="0"
			class="w-12 h-12 relative flex-center hoverable:text-humbak-8 bg-white z-1 before:(content-empty fixed inset-x-0 -z-1 pointer-events-none bg-inherit h-12 right-[calc(50%_-_0.5rem)]) lg:(before:hidden bg-inherit hoverable:text-inherit)"
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
			<span class="visually-hidden">
				{{ language }}
			</span>
			<div class="i-ph-translate-bold pointer-events-none w-6 h-6" aria-hidden="true" />
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
				class="absolute flex flex-row transition-transform z-0 top-0 left-0 lg:(bottom-0 duration-0 transition-none top-auto bg-humbak-5 left-1/2 block z-10 w-12 translate-y-full shadow-md -translate-x-1/2)"
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
					class="select-none font-700 lg:font-400"
					:class="cursoredOverIndex === index ? 'text-humbak-8 bg-humbak/20 lg:(bg-humbak-7 text-black)' : 'text-black'"
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
		</transition>
	</div>
</template>
