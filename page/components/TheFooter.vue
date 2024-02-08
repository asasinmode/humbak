<script setup lang="ts">
import type { IFooterContents } from '~/types/api';

const props = defineProps<{
	data?: IFooterContents;
}>();

const emails = computed(() => props.data?.emails || []);
const phoneNumbers = computed(() => props.data?.phoneNumbers || []);
const socials = computed(() => props.data?.socials || []);
const location = computed(() => props.data?.location || {});

const maxElementsInColumn = computed(() => Math.max(emails.value.length, phoneNumbers.value.length, 1));

const socialToIcon: Record<IFooterContents['socials'][number]['type'], string> = {
	facebook: 'i-logos-facebook',
	youtube: 'i-logos-youtube-icon',
	instagram: 'i-logos-instagram-icon scale-90',
	twitter: 'i-logos-twitter brightness-0 hue-0',
};
</script>

<template>
	<footer class="relative grid grid-cols-1 w-full justify-items-center gap-6 bg-humbak pb-4 pt-8 text-black md:px-[clamp(2rem,_-12.25rem_+_29.6875vw,_6.75rem)] md:pb-6 mt-auto lg:px-8">
		<section class="grid grid-cols-[min-content_max-content] max-w-360 gap-x-3 gap-y-4 lg:grid-cols-[repeat(3,_1fr_2fr)] md:grid-cols-[min-content_6fr_4fr_6fr_4fr_max-content] md:w-full">
			<template v-for="(email, index) in emails" :key="`email${index}`">
				<div
					class="md:footer-row-span i-fa6-solid-envelope h-6 w-6 justify-self-end md:col-start-1"
					aria-hidden="true"
					:style="`--f-row-start: ${index + 1};`"
				/>
				<a
					:href="`mailto:${email}`"
					class="md:footer-row-span h-fit w-fit md:col-start-2 hoverable:underline"
					:style="`--f-row-start: ${index + 1};`"
				>
					{{ email }}
				</a>
			</template>

			<template v-for="(phoneNumber, index) in phoneNumbers" :key="`phone${index}`">
				<div
					class="md:footer-row-span i-fa6-solid-phone h-6 w-6 justify-self-end md:col-start-3 -mr-[clamp(0.25rem,_-5.75rem_+_7.5vw,_1rem)]"
					aria-hidden="true"
					:style="`--f-row-start: ${index + 1};`"
				/>
				<p
					class="md:footer-row-span ml-[clamp(0.25rem,_-5.75rem_+_7.5vw,_1rem)] h-fit w-fit md:col-start-4"
					:style="`--f-row-start: ${index + 1};`"
				>
					{{ phoneNumber }}
				</p>
			</template>

			<div
				v-if="location.text"
				class="md:footer-row-span i-fa6-solid-map-location-dot h-6 w-6 justify-self-end"
				aria-hidden="true"
				:style="`--f-row-start: 1; --f-row-span: ${maxElementsInColumn}`"
			/>
			<div
				v-if="location.text"
				class="md:footer-row-span relative h-fit w-fit"
				:style="`--f-row-start: 1; --f-row-span: ${maxElementsInColumn}`"
			>
				<a
					:href="location.value"
					class="hoverable:underline"
					target="_blank"
				>
					{{ location.text }}
				</a>
			</div>
		</section>

		<section v-if="socials" class="relative col-span-full flex flex-wrap justify-center gap-4">
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
		</section>
	</footer>
</template>

<style>
@media (min-width: 768px){
	.md\:footer-row-span {
		grid-row: var(--f-row-start, 1) / span var(--f-row-span, 1);
	}
}
</style>
