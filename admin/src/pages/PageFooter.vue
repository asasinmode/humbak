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

const locationTextModelValue = ref('');
const locationValueModelValue = ref('');

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
		locationTextModelValue.value = '';
		locationValueModelValue.value = '';
	} catch (e) {
		toast('błąd przy ładowaniu stopki', 'error');
		console.error(e);
	} finally {
		isLoading.value = false;
	}
}

const maxElementsInColumn = computed(() => Math.max(emails.value.length + 1, phoneNumbers.value.length + 1, 1));
const emailRowSpan = computed(() =>
	maxElementsInColumn.value - emails.value.length - (maxElementsInColumn.value === emails.value.length + 1 ? 0 : 1)
);
const phoneNumbersRowSpan = computed(() =>
	maxElementsInColumn.value - phoneNumbers.value.length - (maxElementsInColumn.value === phoneNumbers.value.length + 1 ? 0 : 1)
);

const socialToIcon: Record<IFooterContents['socials'][number]['type'], string> = {
	facebook: 'i-logos-facebook',
	youtube: 'i-logos-youtube-icon',
	instagram: 'i-logos-instagram',
	twitter: 'i-logos-twitter',
};

const addPhoneButtonRef = ref<HTMLButtonElement>();
const addEmailButtonRef = ref<HTMLButtonElement>();

function deleteRow(type: 'email' | 'phone', index: number) {
	const target = type === 'email' ? emails.value : phoneNumbers.value;
	if (target.length === 1) {
		(type === 'email' ? addEmailButtonRef.value : addPhoneButtonRef.value)?.focus();
	} else if (index === 0) {
		document.getElementById(`footerRowExpandActions${type}0`)?.focus();
	} else {
		document.getElementById(`footerRowExpandActions${type}${index - 1}`)?.focus();
	}
	target.splice(index, 1);
}

function addRow(type: 'email' | 'phone') {
	(type === 'email' ? emails.value : phoneNumbers.value).push('');
}

const isEditingLocation = ref(false);
const locationTextInputRef = ref<HTMLInputElement>();
const locationValueInputRef = ref<HTMLInputElement>();

function editLocation() {
	isEditingLocation.value = true;
	locationTextModelValue.value = location.value.text;
	locationValueModelValue.value = location.value.value;
	nextTick(() => locationTextInputRef.value?.focus());
}

function stopEditingLocation(updateValue: boolean, event?: FocusEvent) {
	if (event?.relatedTarget !== locationTextInputRef.value && event?.relatedTarget !== locationValueInputRef.value) {
		isEditingLocation.value = false;
		nextTick(() => document.getElementById('footerRowExpandActionslocation0')?.focus());
	}
	if (updateValue) {
		location.value.text = locationTextModelValue.value;
		location.value.value = locationValueModelValue.value;
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
		<div class="relative grid col-span-full grid-cols-1 w-full justify-items-center gap-4 bg-humbak px-2 pb-4 pt-6 text-black lg:px-8 md:px-[clamp(2rem,_-12.25rem_+_29.6875vw,_6.75rem)]">
			{{ maxElementsInColumn }} - emails: {{ emails.length }} - phones: {{ phoneNumbers.length }}
			<section class="grid grid-cols-[min-content_max-content] max-w-360 gap-x-3 gap-y-4 lg:grid-cols-[repeat(3,_1fr_2fr)] md:grid-cols-[min-content_6fr_4fr_6fr_4fr_max-content] md:w-full">
				<template v-for="index in emails.length" :key="`emails${index - 1}`">
					<div
						class="md:footer-row-span i-fa6-solid-envelope h-6 w-6 justify-self-end md:col-start-1"
						aria-hidden="true"
						:style="`--f-row-start: ${index}; --f-row-span: ${emailRowSpan}`"
					/>
					<FooterRow
						:id="index - 1"
						v-model="emails[index - 1]"
						class="md:footer-row-span h-fit w-fit md:col-start-2"
						:style="`--f-row-start: ${index}; --f-row-span: ${emailRowSpan}`"
						type="email"
						@delete="deleteRow('email', index - 1)"
					/>
				</template>
				<button
					ref="addEmailButtonRef"
					class="md:footer-row-span col-span-2 mx-auto h-8 w-fit border-2 border-emerald-5 rounded-full bg-emerald px-2 text-sm shadow md:col-start-1 hoverable:brightness-110"
					:class="emails.length !== maxElementsInColumn - 1 ? '-my-1' : ''"
					:style="`--f-row-start: ${emails.length + 1}; --f-row-span: ${Math.max(maxElementsInColumn - emails.length, 1)};`"
					@click="addRow('email')"
				>
					dodaj email
				</button>

				<template v-for="index in phoneNumbers.length" :key="`phones${index}`">
					<div
						class="md:footer-row-span i-fa6-solid-phone h-6 w-6 justify-self-end md:col-start-3 -mr-[clamp(0.25rem,_-5.75rem_+_7.5vw,_1rem)]"
						aria-hidden="true"
						:style="`--f-row-start: ${index};`"
					/>
					<FooterRow
						:id="index - 1"
						v-model="phoneNumbers[index - 1]"
						class="md:footer-row-span ml-[clamp(0.25rem,_-5.75rem_+_7.5vw,_1rem)] h-fit w-fit md:col-start-4"
						:style="`--f-row-start: ${index};`"
						type="phone"
						@delete="deleteRow('phone', index - 1)"
					/>
				</template>
				<button
					ref="addPhoneButtonRef"
					class="md:footer-row-span col-span-2 mx-auto h-8 w-fit border-2 border-emerald-5 rounded-full bg-emerald px-2 text-sm shadow md:col-start-3 lg:translate-x-0 md:translate-x-6 hoverable:brightness-110"
					:class="phoneNumbers.length !== maxElementsInColumn - 1 ? '-my-1' : ''"
					:style="`--f-row-start: ${phoneNumbers.length + 1}; --f-row-span: ${Math.max(maxElementsInColumn - phoneNumbers.length, 1)};`"
					@click="addRow('phone')"
				>
					dodaj telefon
				</button>

				<div
					class="md:footer-row-span i-fa6-solid-map-location-dot h-6 w-6 justify-self-end"
					aria-hidden="true"
					:style="`--f-row-start: 1; --f-row-span: ${maxElementsInColumn}`"
				/>
				<div
					class="md:footer-row-span relative h-fit w-fit"
					:style="`--f-row-start: 1; --f-row-span: ${maxElementsInColumn}`"
				>
					<template v-if="isEditingLocation">
						<label class="visually-hidden" for="footerlocation0text">{{ location.text || 'lokacja' }}</label>
						<input
							id="footerlocation0text"
							ref="locationTextInputRef"
							v-model="locationTextModelValue"
							class="absolute z-10 min-w-0 w-[calc(100%_+_clamp(2rem,_-2.5714rem_+_9.5238vw,_6rem))] border-2 border-neutral-5 rounded-full bg-white px-2 py-[0.125rem] -left-[0.625rem] -top-[0.25rem]"
							@focusout="stopEditingLocation(true, $event)"
							@keydown.esc="stopEditingLocation(false)"
							@keydown.enter.prevent="stopEditingLocation(true)"
						>
						<label class="visually-hidden" for="footerlocation0value">{{ location.text || 'lokacja' }} link</label>
						<input
							id="footerlocation0value"
							ref="locationValueInputRef"
							v-model="locationValueModelValue"
							class="absolute z-10 min-w-0 w-[calc(100%_+_clamp(2rem,_-2.5714rem_+_9.5238vw,_6rem))] translate-y-[calc(100%_+_0.75rem)] border-2 border-neutral-5 rounded-full bg-white px-2 py-[0.125rem] -left-[0.625rem] -top-[0.25rem]"
							@focusout="stopEditingLocation(true, $event)"
							@keydown.esc="stopEditingLocation(false)"
							@keydown.enter.prevent="stopEditingLocation(true)"
						>
					</template>
					<a
						:href="location.value"
						class="hoverable:underline"
						target="_blank"
						:class="isEditingLocation ? 'op-0' : ''"
						:aria-hidden="isEditingLocation"
					>
						{{ location.text || 'lokacja' }}
					</a>
					<FooterRowActionSelect
						v-if="!isEditingLocation"
						class="top-1/2 translate-x-full !absolute -right-2 -translate-y-1/2"
						:index="0"
						type="location"
						:title="location.text || 'lokacja'"
						@edit="editLocation"
					/>
				</div>
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
			<VLoading v-show="isLoading" class="absolute inset-0 z-30" size="20" />
		</div>
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
		grid-row: var(--f-row-start, 1) / span var(--f-row-span, 1);
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
