<script setup lang="ts">
import VButton from '~/components/V/VButton.vue';

const api = useApi();
const { login, isVerifying } = useAuth();
const router = useRouter();

const saveButton = ref<InstanceType<typeof VButton>>();

const {
	username,
	password,
	sendForm,
	isSaving,
	errors,
} = useForm(
	{ username: '', password: '' },
	async () => {
		const serverJwt = await api.auth.login.$post({
			json: { username: username.value, password: password.value },
		})
			.then((r: Response) => r.text());

		login(username.value, serverJwt);
		router.push('/');
	},
	() => saveButton.value?.element
);
</script>

<template>
	<main id="content" class="flex-center min-h-screen">
		<VLoading v-if="isVerifying" class="absolute inset-0 flex-center" :size="30" />
		<form id="loginForm" class="flex flex-col gap-5 py-8 px-2 items-center text-lg" @submit.prevent="sendForm(false)">
			<VInput
				id="username"
				v-model="username"
				label="nazwa użytkownika"
				:disabled="isVerifying"
				:error="errors.username"
				@update:model-value="errors.username = ''"
			/>
			<VInput
				id="password"
				v-model="password"
				label="hasło"
				type="password"
				:disabled="isVerifying"
				:error="errors.password"
				@update:model-value="errors.password = ''"
			/>
			<VButton ref="saveButton" class="neon-green mt-3" :is-loading="isSaving" :disabled="isVerifying">
				zaloguj się
			</VButton>
		</form>
	</main>
</template>

<style>
@media (min-height: 22.5rem){
	#loginForm {
		@apply pt-6
	}
}

@media (min-height: 32.5rem){
	#loginForm {
		@apply pt-4
	}
}
</style>
