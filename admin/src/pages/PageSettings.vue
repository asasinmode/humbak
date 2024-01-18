<script setup lang="ts">
const router = useRouter();
const { logout: authLogout } = useAuth();

function logout() {
	authLogout();
	router.push('/login');
}
</script>

<template>
	<main id="content" class="flex-center flex-col">
		ustawienia
		<VButton class="neon-yellow" @click="logout">
			wyloguj się
		</VButton>
	</main>
</template>
