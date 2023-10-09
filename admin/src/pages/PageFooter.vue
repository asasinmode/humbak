<script setup lang="ts">
import VButton from '~/components/V/VButton.vue';
import type { IFooterContents, IUniqueLanguage } from '~/composables/useApi';

const { toast, toastGenericError } = useToast();
const api = useApi();

const saveButton = ref<InstanceType<typeof VButton>>();

const isLoadingLanguages = ref(false);
const languages = ref<IUniqueLanguage[]>([]);
const selectedLanguage = ref<string>();
let previousSelectedLanguage: string | undefined;

const isLoading = ref(false);

const {
	clearForm, sendForm, updateValues, isSaving,
	errors, hasChanged,
	emails, phoneNumbers, location, socials,
} = useForm<Omit<IFooterContents, 'language'>>(
	{ emails: [], phoneNumbers: [], location: { text: '', value: '' }, socials: [] },
	async () => {
		await new Promise(resolve => setTimeout(resolve, 500));
	},
	saveButton.value?.element
);

onMounted(async () => {
	isLoadingLanguages.value = true;
	try {
		languages.value = await api.pages.uniqueLanguages.query();

		if (!languages.value.length) {
			return;
		}

		selectedLanguage.value = languages.value[0];
		getFooterContent();
	} catch (e) {
		toast('błąd przy ładowaniu języków', 'error');
		console.error(e);
	} finally {
		isLoadingLanguages.value = false;
	}
});

async function getFooterContent() {
	if (!selectedLanguage.value) {
		toastGenericError();
		throw new Error('calling get footer content without selected language');
	}

	if (previousSelectedLanguage === selectedLanguage.value) {
		return;
	}

	isLoading.value = true;
	try {
		const data = await api.footer.byLanguage.query(selectedLanguage.value);
		previousSelectedLanguage = selectedLanguage.value;

		if (!data) {
			clearForm(undefined, true);
			return;
		}

		emails.value = data.emails;
		phoneNumbers.value = data.phoneNumbers;
		location.value = data.location;
		socials.value = data.socials;
	} catch (e) {
		toast('błąd przy ładowaniu stopki', 'error');
		console.error(e);
	} finally {
		isLoading.value = false;
	}
}
</script>

<template>
	<main id="content" class="flex flex-col gap-x-3 gap-y-5 pb-4 pt-[1.125rem]">
		<div class="grid grid-cols-[1fr_min-content] mx-auto max-w-360 w-full gap-x-3">
			<VCombobox
				id="footerLanguage"
				v-model="selectedLanguage"
				class="footer-controls-padding-left footer-language-select !min-w-20 !w-20"
				class-input="!min-w-20 !w-20"
				label="język"
				:options="languages"
				:is-loading="isLoadingLanguages"
				transform-options
				select-only
				label-visually-hidden
				@select-option="getFooterContent"
			/>
			<VButton
				ref="saveButton"
				class="footer-controls-padding-right mr-12 h-fit md:mr-0 neon-green"
				:is-loading="isSaving"
				@click="sendForm"
			>
				zapisz
			</VButton>
		</div>
		<footer class="relative col-span-full w-full bg-humbak">
			<div class="mx-auto max-w-360 min-h-10 w-full text-black">
				{{ emails }} <br>
				{{ phoneNumbers }} <br>
				{{ location }} <br>
				{{ socials }} <br>
			</div>
			<VLoading v-show="isLoading" class="absolute inset-0" size="20" />
		</footer>
	</main>
</template>

<style>
.footer-controls-padding-left {
	left: 1rem;
}

.footer-controls-padding-right {
	right: 1rem;
}

@media(min-width: 90rem){
	.footer-controls-padding-left {
		left: clamp(0rem, 73rem + -80vw, 1rem);
	}

	.footer-controls-padding-right {
		right: clamp(0rem, 73rem + -80vw, 1rem);
	}
}
</style>
