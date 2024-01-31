<script setup lang="ts">
import VButton from '~/components/V/VButton.vue';
import type { IFooterContents } from '~/composables/useApi';

const { toast, toastGenericError } = useToast();
const api = useApi();

const saveButton = ref<InstanceType<typeof VButton>>();

const isLoadingLanguages = ref(false);
const languages = ref<string[]>([]);
let previousSelectedLanguage: string | undefined;

const locationTextModelValue = ref('');
const locationValueModelValue = ref('');

const isLoading = ref(false);
const saveKey = ref(0);

const {
	clearForm,
	sendForm,
	updateValues,
	isSaving,
	errors,
	emails,
	phoneNumbers,
	location,
	socials,
	language,
} = useForm<IFooterContents>(
	{ emails: [], phoneNumbers: [], location: { text: '', value: '' }, socials: [], language: '' },
	async () => {
		const footerData = await api.footerContents.$post({
			json: {
				emails: emails.value,
				phoneNumbers: phoneNumbers.value,
				location: location.value,
				socials: socials.value,
				language: language.value,
			},
		}).then(r => r.json());

		updateValues(footerData);
		locationTextModelValue.value = '';
		locationValueModelValue.value = '';
		saveKey.value += 1;
	},
	() => saveButton.value?.element
);

async function getFooterContent() {
	if (!language.value || previousSelectedLanguage === language.value) {
		return;
	}

	isLoading.value = true;
	try {
		const data = await api.footerContents.$get({ query: { language: language.value } }).then(r => r.json());
		previousSelectedLanguage = language.value;

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

const socialToIcon: Record<IFooterContents['socials'][number]['type'], string> = {
	facebook: 'i-logos-facebook',
	youtube: 'i-logos-youtube-icon',
	instagram: 'i-logos-instagram-icon scale-90',
	twitter: 'i-logos-twitter brightness-0 hue-0',
};

const addPhoneButtonRef = ref<HTMLButtonElement>();
const addEmailButtonRef = ref<HTMLButtonElement>();

function deleteRow(type: 'email' | 'phone', index: number) {
	const target = type === 'email' ? emails.value : phoneNumbers.value;
	target.splice(index, 1);
	nextTick(() => {
		if (target.length === 0) {
			(type === 'email' ? addEmailButtonRef.value : addPhoneButtonRef.value)?.focus();
		} else if (index === 0) {
			document.getElementById(`footerRowExpandActions${type}0`)?.focus();
		} else {
			document.getElementById(`footerRowExpandActions${type}${index - 1}`)?.focus();
		}
	});
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

const allSocials = Object.keys(socialToIcon) as IFooterContents['socials'][number]['type'][];
const usedSocials = computed(() => socials.value.map(social => social.type));
const availableSocials = computed(() => allSocials.filter(social => !usedSocials.value.includes(social)));

function addSocial() {
	if (!availableSocials.value.length) {
		toastGenericError();
		throw new Error('add social called without available socials');
	}

	socials.value.push({ type: availableSocials.value[0], value: '' });
}
</script>

<template>
	<main id="content" class="flex flex-col gap-x-3 gap-y-5 pb-4 pt-[1.125rem]">
		<div class="px-container grid grid-cols-[1fr_min-content] mx-auto max-w-360 w-full gap-x-3">
			<LanguageSelect v-model="language" @select-option="getFooterContent" @languages-loaded="getFooterContent" />
			<VButton
				ref="saveButton"
				class="mr-12 h-fit md:mr-0 neon-green"
				:disabled="isLoading"
				:is-loading="isSaving"
				@click="sendForm"
			>
				zapisz
			</VButton>
		</div>
		<div class="relative grid col-span-full grid-cols-1 w-full justify-items-center gap-4 bg-humbak pb-4 pt-6 text-black lg:px-8 md:px-[clamp(2rem,_-12.25rem_+_29.6875vw,_6.75rem)]">
			<section class="grid grid-cols-[min-content_max-content] max-w-360 gap-x-3 gap-y-4 lg:grid-cols-[repeat(3,_1fr_2fr)] md:grid-cols-[min-content_6fr_4fr_6fr_4fr_max-content] md:w-full">
				<template v-for="index in emails.length" :key="`email${index}`">
					<div
						class="md:footer-row-span i-fa6-solid-envelope h-6 w-6 justify-self-end md:col-start-1"
						aria-hidden="true"
						:style="`--f-row-start: ${index};`"
					/>
					<FooterRow
						:id="index - 1"
						v-model="emails[index - 1]"
						class="md:footer-row-span h-fit w-fit md:col-start-2"
						type="email"
						:style="`--f-row-start: ${index};`"
						:save-key="saveKey"
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

				<template v-for="index in phoneNumbers.length" :key="`phone${index}`">
					<div
						class="md:footer-row-span i-fa6-solid-phone h-6 w-6 justify-self-end md:col-start-3 -mr-[clamp(0.25rem,_-5.75rem_+_7.5vw,_1rem)]"
						aria-hidden="true"
						:style="`--f-row-start: ${index};`"
					/>
					<FooterRow
						:id="index - 1"
						v-model="phoneNumbers[index - 1]"
						class="md:footer-row-span ml-[clamp(0.25rem,_-5.75rem_+_7.5vw,_1rem)] h-fit w-fit md:col-start-4"
						type="phone"
						:save-key="saveKey"
						:style="`--f-row-start: ${index};`"
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

			<section class="relative col-span-full flex flex-wrap justify-center gap-4">
				<a
					v-for="social in socials"
					:key="social.value"
					:title="`link ${social.type}`"
					:href="social.value"
					target="_blank"
					class="drop-shadow transition-transform hoverable:scale-120"
				>
					<span class="visually-hidden">link {{ social.type }}</span>
					<div class="h-8 w-8" :class="socialToIcon[social.type]" />
				</a>
				<p v-if="!socials.length" class="h-8 flex items-center">
					sociale
				</p>

				<VDialog
					class="right-0 h-8 w-8 translate-x-[calc(100%_+_1rem)] border-2 border-blue-5 rounded-1/2 bg-blue shadow !absolute hoverable:(brightness-110)"
					title="edytuj sociale"
					class-container="grid grid-cols-[1fr_1fr_min-content] gap-x-3 gap-y-5"
					class-close-button="col-span-full mx-auto w-fit"
					close-button-text="zamknij"
				>
					<template #button>
						<span class="visually-hidden">edytuj sociale</span>
						<div class="i-mdi-wrench group absolute left-1/2 top-1/2 h-4 w-4 translate-center" />
					</template>

					<h3 class="col-span-full text-center text-5 font-600">
						sociale
					</h3>

					<template v-for="index in socials.length" :key="`social${index}`">
						<VCombobox
							:id="`social${index - 1}type`"
							v-model="socials[index - 1].type"
							:options="availableSocials"
							label="typ"
							transform-options
							select-only
						/>
						<VInput
							:id="`social${index - 1}value`"
							v-model="socials[index - 1].value"
							label="link"
						/>
						<VButton
							class="h-fit self-end neon-red"
							:title="`usuń ${socials[index - 1].type}`"
							@click="socials.splice(index - 1, 1)"
						>
							usuń <span class="visually-hidden">{{ socials[index - 1].type }}</span>
						</VButton>
					</template>

					<button
						v-if="availableSocials.length"
						class="col-span-full mx-auto mb-2 w-fit px-3 py-1 neon-green"
						@click="addSocial"
					>
						dodaj social
					</button>
				</VDialog>
			</section>
			<VLoading v-show="isLoading" class="absolute inset-0 z-30" size="25" />
		</div>
		<p v-if="errors.emails" class="text-center text-red-5">
			Emaile: {{ errors.emails }}
		</p>
		<p v-if="errors.phoneNumbers" class="text-center text-red-5">
			Telefony: {{ errors.phoneNumbers }}
		</p>
		<p v-if="errors.location" class="text-center text-red-5">
			Lokacja: {{ errors.location }}
		</p>
		<p v-if="errors.socials" class="text-center text-red-5">
			Sociale: {{ errors.socials }}
		</p>
	</main>
</template>

<style>
@media (min-width: 768px){
	.md\:footer-row-span {
		grid-row: var(--f-row-start, 1) / span var(--f-row-span, 1);
	}
}
</style>
