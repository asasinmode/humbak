<script setup lang="ts">
const router = useRouter();
const { logout: authLogout } = useAuth();

function logout() {
	authLogout();
	router.push('/login');
}

const { username, errors, sendForm, isSaving } = useForm(
	{ username: '' },
	async () => {
		console.log('changing username', username.value);
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

		<form class="mx-auto items-center max-w-360 w-full flex flex-col px-container flex-wrap" @submit.prevent="sendForm()">
			<fieldset class="flex w-fit gap-5 flex-col border-2 rounded-lg shadow border-neutral p-4">
				<legend class="text-lg">
					zmiana nazwy użytkownika
				</legend>
				<VInput
					id="settingsUsername"
					v-model="username"
					label="nazwa"
					:error="errors.username"
					@update:model-value="errors.username = ''"
				/>
				<VButton class="neon-green w-fit ml-auto" :is-loading="isSaving">
					zapisz
				</VButton>
			</fieldset>
		</form>
	</main>
</template>
