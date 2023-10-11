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
	errors,
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

const largestNumberOfLinksInColumn = computed(() => Math.max(emails.value.length, phoneNumbers.value.length, 1) + 1);
const emailRowSpan = computed(() => largestNumberOfLinksInColumn.value - emails.value.length);
const phoneNumbersRowSpan = computed(() => largestNumberOfLinksInColumn.value - phoneNumbers.value.length);

const socialToIcon: Record<IFooterContents['socials'][number]['type'], string> = {
	facebook: 'i-logos-facebook',
	youtube: 'i-logos-youtube-icon',
	instagram: 'i-logos-instagram',
	twitter: 'i-logos-twitter',
};
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
		<footer class="relative grid col-span-full grid-cols-1 w-full justify-items-center gap-4 bg-humbak px-2 pb-4 pt-6 text-black">
			<section class="grid grid-cols-[min-content_max-content] gap-x-3 gap-y-4 md:grid-cols-[repeat(3,_min-content_1fr)]">
				<template v-for="(email, index) in emails" :key="email">
					<div
						class="md:footer-row-span i-fa6-solid-envelope h-6 w-6 justify-self-end"
						:style="`--f-col-start: ${index + 1}; --f-col-span: ${emailRowSpan}`"
					/>
					<a
						:href="`mailto:${email}`"
						class="md:footer-row-span hoverable:underline"
						:style="`--f-col-start: ${index + 1}; --f-col-span: ${emailRowSpan}`"
					>
						{{ email }}
					</a>
				</template>

				<template v-for="(phone, index) in phoneNumbers" :key="phone">
					<div
						class="md:footer-row-span i-fa6-solid-phone ml-3 h-6 w-6 justify-self-end"
						:style="`--f-col-start: ${index + 1}; --f-col-span: ${phoneNumbersRowSpan}`"
					/>
					<p class="md:footer-row-span mr-3 h-fit w-fit" :style="`--f-col-start: ${index + 1}; --f-col-span: ${phoneNumbersRowSpan}`">
						{{ phone }}
					</p>
				</template>

				<span
					class="md:footer-row-span i-fa6-solid-map-location-dot h-6 w-6 justify-self-end"
					:style="`--f-col-start: 1; --f-col-span: ${largestNumberOfLinksInColumn - 1}`"
				/>
				<a
					:href="location.value"
					class="md:footer-row-span h-fit w-fit hoverable:underline"
					target="_blank"
					:style="`--f-col-start: 1; --f-col-span: ${largestNumberOfLinksInColumn - 1}`"
				>
					{{ location.text }}
				</a>
			</section>

			<section class="col-span-full flex flex-wrap justify-center gap-4">
				<a
					v-for="social in socials"
					:key="social.value"
					:title="`link ${social.type}`"
					:href="social.value"
					target="_blank"
					class="transition-transform hoverable:scale-120"
				>
					<span class="visually-hidden">link {{ social.type }}</span>
					<div class="h-8 w-8" :class="socialToIcon[social.type]" />
				</a>
			</section>
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

@media (min-width: 768px){
	.md\:footer-row-span {
		grid-row: var(--f-col-start, 1) / span var(--f-col-span, 1);
	}
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
