<script setup lang="ts">
const router = useRouter();
const { logout: authLogout } = useAuth();

function logout() {
	authLogout();
	router.push('/login');
}

const {
	username,
	errors: usernameErrors,
	sendForm: sendUsernameForm,
	isSaving: isUsernameSaving,
} = useForm(
	{ username: '' },
	async () => {
		console.log('changing username', username.value);
	}
);

const {
	oldPassword,
	newPassword,
	errors: passwordErrors,
	sendForm: sendPasswordForm,
	isSaving: isPasswordSaving,
} = useForm(
	{ oldPassword: '', newPassword: '' },
	async () => {
		console.log('saving password', oldPassword.value, newPassword.value);
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

		<div class="mx-auto max-w-360 w-full px-container">
			<form class="flex flex-col items-center" @submit.prevent="sendUsernameForm()">
				<fieldset class="flex w-fit gap-5 flex-col border-2 rounded-lg shadow border-neutral p-4">
					<legend class="text-lg">
						zmiana nazwy użytkownika
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
						v-model="newPassword"
						label="stare hasło"
						:error="passwordErrors.oldPassword"
						@update:model-value="passwordErrors.oldPassword = ''"
					/>
					<VInput
						id="settingsNewPassword"
						v-model="oldPassword"
						label="nowe hasło"
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
