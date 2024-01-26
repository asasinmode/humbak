<script setup lang="ts">
import type { IFooterContents } from '~/types/api';

const props = defineProps<{
	data: IFooterContents;
}>();

const { emails, phoneNumbers, socials, location } = toRefs(props.data);

const maxElementsInColumn = computed(() => Math.max(emails.value.length + 1, phoneNumbers.value.length + 1, 1));

const socialToIcon: Record<IFooterContents['socials'][number]['type'], string> = {
	facebook: 'i-logos-facebook',
	youtube: 'i-logos-youtube-icon',
	instagram: 'i-logos-instagram-icon scale-90',
	twitter: 'i-logos-twitter brightness-0 hue-0',
};
</script>

<template>
	<footer class="relative grid col-span-full grid-cols-1 w-full justify-items-center gap-4 bg-humbak pb-4 pt-6 text-black lg:px-8 md:px-[clamp(2rem,_-12.25rem_+_29.6875vw,_6.75rem)]">
		<section class="grid grid-cols-[min-content_max-content] max-w-360 gap-x-3 gap-y-4 lg:grid-cols-[repeat(3,_1fr_2fr)] md:grid-cols-[min-content_6fr_4fr_6fr_4fr_max-content] md:w-full">
			<template v-for="(email, index) in emails" :key="`email${index}`">
				<div
					class="md:footer-row-span i-fa6-solid-envelope h-6 w-6 justify-self-end md:col-start-1"
					aria-hidden="true"
					:style="`--f-row-start: ${index};`"
				/>
				<a
					:href="`mailto:${email}`"
					class="md:footer-row-span h-fit w-fit md:col-start-2 hoverable:underline"
				>
					{{ email }}
				</a>
			</template>

			<template v-for="(phoneNumber, index) in phoneNumbers" :key="`phone${index}`">
				<div
					class="md:footer-row-span i-fa6-solid-phone h-6 w-6 justify-self-end md:col-start-3 -mr-[clamp(0.25rem,_-5.75rem_+_7.5vw,_1rem)]"
					aria-hidden="true"
					:style="`--f-row-start: ${index};`"
				/>
				<p class="md:footer-row-span ml-[clamp(0.25rem,_-5.75rem_+_7.5vw,_1rem)] h-fit w-fit md:col-start-4">
					{{ phoneNumber }}
				</p>
			</template>

			<div
				class="md:footer-row-span i-fa6-solid-map-location-dot h-6 w-6 justify-self-end"
				aria-hidden="true"
				:style="`--f-row-start: 1; --f-row-span: ${maxElementsInColumn}`"
			/>
			<div
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
		</section>
	</footer>
</template>
