<script setup lang="ts">
import type { AdminVButton } from '#components';

definePageMeta({ layout: 'admin-navigationless', noAuth: true });
useHead({ title: 'login - Admin' });

const saveButton = ref<InstanceType<typeof AdminVButton>>();

const {
	username,
	password,
	sendForm,
	isSaving,
	errors,
} = useForm(
	{ username: '', password: '' },
	async () => {
		const { jwt } = await useApi('/api/admin/auth/login', {
			method: 'post',
			body: { username: username.value, password: password.value },
		});

		useState('adminUsername').value = username.value;
		useState('adminJwt').value = jwt;
		localStorage.setItem('adminJwt', jwt);

		navigateTo('/admin');
	},
	() => saveButton.value?.element,
);
</script>

<template>
	<main id="content" class="min-h-screen flex-center">
		<form id="loginForm" class="flex flex-col items-center gap-5 px-2 py-8 text-lg" @submit.prevent="sendForm(false)">
			<AdminVInput
				id="username"
				v-model="username"
				label="nazwa użytkownika"
				:error="errors.username"
				@update:model-value="errors.username = ''"
			/>
			<AdminVInput
				id="password"
				v-model="password"
				label="hasło"
				type="password"
				:error="errors.password"
				@update:model-value="errors.password = ''"
			/>
			<AdminVButton ref="saveButton" class="mt-3 neon-green" :is-loading="isSaving">
				zaloguj się
			</AdminVButton>
		</form>
	</main>
</template>

<style>
@media (min-height: 22.5rem) {
	#loginForm {
		@apply pt-6;
	}
}

@media (min-height: 32.5rem) {
	#loginForm {
		@apply pt-4;
	}
}
</style>
