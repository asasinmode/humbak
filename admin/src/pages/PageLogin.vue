<script setup lang="ts">
import VButton from '~/components/V/VButton.vue';

const api = useApi();
const { login } = useAuth();
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
		// @ts-expect-error idk why type is wrong
		const serverJwt = await api.auth.login.$post({
			json: { username: username.value, password: password.value },
		}).then((r: Response) => r.text());

		login(username.value, serverJwt);
		router.push('/');
	},
	saveButton.value?.element
);
</script>

<template>
	<main id="content" class="flex-center min-h-screen">
		<form class="flex flex-col gap-5 py-8 px-2 items-center" @submit.prevent="sendForm(false)">
			<VInput
				id="username"
				v-model="username"
				label="nazwa użytkownika"
				:error="errors.username"
				@update:model-value="errors.username = ''"
			/>
			<VInput
				id="password"
				v-model="password"
				label="hasło"
				:error="errors.password"
				@update:model-value="errors.password = ''"
			/>
			<VButton ref="saveButton" class="neon-green mt-3" :is-loading="isSaving">
				zaloguj się
			</VButton>
		</form>
	</main>
</template>
