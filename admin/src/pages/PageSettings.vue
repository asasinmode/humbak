<script setup lang="ts">
const router = useRouter();
const { logout: authLogout } = useAuth();

function logout() {
	authLogout();
	router.push('/login');
}
</script>

<template>
	<main id="content" class="flex flex-col gap-x-3 gap-y-5 pb-4 pt-[1.125rem]">
		<div class="mx-auto max-w-360 w-full md:justify-end flex gap-x-3 px-container">
			<VButton class="neon-blue w-fit" @click="logout">
				<div class="i-ph-sign-out inline-block align-sub text-blue" />
				wyloguj się
			</VButton>
		</div>
	</main>
</template>
