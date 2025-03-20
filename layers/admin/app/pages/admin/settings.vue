<script setup lang="ts">
definePageMeta({ layout: 'admin' });
useHead({ title: 'ustawienia - Admin' });

const auth = useCookie<IAuthCookie | undefined>('auth');

function logout() {
	auth.value = undefined;
	navigateTo('/admin/login');
}

const {
	username,
	errors: usernameErrors,
	sendForm: sendUsernameForm,
	updateValues: updateUsernameValues,
	isSaving: isUsernameSaving,
} = useForm(
	{ username: '' },
	async () => {
		await useApi('/api/admin/auth/changeUsername', { method: 'post', body: { username: username.value } });
		auth.value!.username = username.value;
		refreshCookie('auth');
		updateUsernameValues({
			username: '',
		});
	},
);

const {
	oldPassword,
	newPassword,
	updateValues: updatePasswordValues,
	errors: passwordErrors,
	sendForm: sendPasswordForm,
	isSaving: isPasswordSaving,
} = useForm(
	{ oldPassword: '', newPassword: '' },
	async () => {
		await useApi('/api/admin/auth/changePassword', { method: 'post', body: {
			oldPassword: oldPassword.value,
			newPassword: newPassword.value,
		} });
		updatePasswordValues({
			oldPassword: '',
			newPassword: '',
		});
	},
);
</script>

<template>
	<main id="content" class="flex flex-col gap-x-3 gap-y-5 pb-4 pt-[1.125rem]">
		<div class="mx-auto max-w-360 w-full flex gap-x-3 px-container md:justify-end">
			<AdminVButton class="w-fit neon-blue" @click="logout">
				<div class="i-ph-sign-out inline-block align-sub text-blue" />
				wyloguj się
			</AdminVButton>
		</div>

		<div class="mx-auto max-w-360 w-full flex flex-wrap justify-center gap-5 px-container md:gap-10">
			<form class="flex flex-col items-center" @submit.prevent="sendUsernameForm()">
				<fieldset class="w-fit flex flex-col gap-5 border-2 border-neutral rounded-lg p-4 shadow">
					<legend class="text-lg">
						zmiana nazwy użytkownika ({{ auth?.username }})
					</legend>
					<AdminVInput
						id="settingsUsername"
						v-model="username"
						label="nazwa"
						:error="usernameErrors.username"
						@update:model-value="usernameErrors.username = ''"
					/>
					<AdminVButton class="ml-auto w-fit neon-green" :is-loading="isUsernameSaving">
						zapisz
					</AdminVButton>
				</fieldset>
			</form>

			<form class="flex flex-col items-center" @submit.prevent="sendPasswordForm()">
				<fieldset class="w-fit flex flex-col gap-5 border-2 border-neutral rounded-lg p-4 shadow">
					<legend class="text-lg">
						zmiana hasła
					</legend>
					<AdminVInput
						id="settingsOldPassword"
						v-model="oldPassword"
						label="stare hasło"
						type="password"
						:error="passwordErrors.oldPassword"
						@update:model-value="passwordErrors.oldPassword = ''"
					/>
					<AdminVInput
						id="settingsNewPassword"
						v-model="newPassword"
						label="nowe hasło"
						type="password"
						:error="passwordErrors.newPassword"
						@update:model-value="passwordErrors.newPassword = ''"
					/>
					<AdminVButton class="ml-auto w-fit neon-green" :is-loading="isPasswordSaving">
						zapisz
					</AdminVButton>
				</fieldset>
			</form>
		</div>
	</main>
</template>
