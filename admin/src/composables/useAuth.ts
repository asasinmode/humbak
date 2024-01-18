import type { Router } from 'vue-router';

const api = useApi();

const username = ref('');
const jwt = ref('');
const isLoggedIn = ref(false);
const isVerifying = ref(false);

export function useAuth(router?: Router) {
	function login(user: string, token: string) {
		username.value = user;
		jwt.value = token;
		isLoggedIn.value = true;

		localStorage.setItem('username', user);
		localStorage.setItem('jwt', token);

		router?.push('/');
	}

	function logout() {
		username.value = '';
		jwt.value = '';
		isLoggedIn.value = false;

		localStorage.setItem('username', '');
		localStorage.setItem('jwt', '');

		router?.push('/login');
	}

	async function init() {
		const storedUsername = localStorage.getItem('username');
		const storedJwt = localStorage.getItem('jwt');

		if (!storedUsername || !storedJwt) {
			return;
		}

		isVerifying.value = true;

		try {
			// @ts-expect-error idk why types are wrong
			await api.auth.verify.$get();
			username.value = storedUsername;
			jwt.value = storedJwt;
			isLoggedIn.value = true;
		} catch (error) {
			console.error(error);
			logout();
		} finally {
			isVerifying.value = false;
		}
	}

	return {
		username,
		jwt,
		isLoggedIn,
		isVerifying,
		login,
		logout,
		init,
	};
}
