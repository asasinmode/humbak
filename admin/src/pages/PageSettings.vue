<script setup lang="ts">
const router = useRouter();
const { logout: authLogout, username: loggedInUsername } = useAuth();
const api = useApi();

function logout() {
	authLogout();
	router.push('/login');
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
		await api.auth.changeUsername.$post({ json: { username: username.value } });
		loggedInUsername.value = username.value;
		updateUsernameValues({
			username: username.value,
		});
	}
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
		await api.auth.changePassword.$post({
			json: {
				oldPassword: oldPassword.value,
				newPassword: newPassword.value,
			},
		});
		updatePasswordValues({
			oldPassword: '',
			newPassword: '',
		});
	}
);
</script>

<template>
	<main id="content" class="flex flex-col gap-x-3 gap-y-5 pb-4 pt-[1.125rem]">
		<div class="mx-auto max-w-360 w-full md:justify-end flex gap-x-3 px-container">
			<VButton class="neon-blue w-fit" @click="logout">
				<div class="i-ph-sign-out inline-block align-sub text-blue" />
				wyloguj się
			</VButton>
		</div>

		<div class="mx-auto max-w-360 w-full flex flex-wrap gap-5 md:gap-10 justify-center px-container">
			<form class="flex flex-col items-center" @submit.prevent="sendUsernameForm()">
				<fieldset class="flex w-fit gap-5 flex-col border-2 rounded-lg shadow border-neutral p-4">
					<legend class="text-lg">
						zmiana nazwy użytkownika ({{ loggedInUsername }})
					</legend>
					<VInput
						id="settingsUsername"
						v-model="username"
						label="nazwa"
						:error="usernameErrors.username"
						@update:model-value="usernameErrors.username = ''"
					/>
					<VButton class="neon-green w-fit ml-auto" :is-loading="isUsernameSaving">
						zapisz
					</VButton>
				</fieldset>
			</form>

			<form class="flex flex-col items-center" @submit.prevent="sendPasswordForm()">
				<fieldset class="flex w-fit gap-5 flex-col border-2 rounded-lg shadow border-neutral p-4">
					<legend class="text-lg">
						zmiana hasła
					</legend>
					<VInput
						id="settingsOldPassword"
						v-model="oldPassword"
						label="stare hasło"
						type="password"
						:error="passwordErrors.oldPassword"
						@update:model-value="passwordErrors.oldPassword = ''"
					/>
					<VInput
						id="settingsNewPassword"
						v-model="newPassword"
						label="nowe hasło"
						type="password"
						:error="passwordErrors.newPassword"
						@update:model-value="passwordErrors.newPassword = ''"
					/>
					<VButton class="neon-green w-fit ml-auto" :is-loading="isPasswordSaving">
						zapisz
					</VButton>
				</fieldset>
			</form>
		</div>
	</main>
</template>
