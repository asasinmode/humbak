const username = ref('');
const jwt = ref('');
const isLoggedIn = ref(false);
const isVerifying = ref(false);

export function useAuth() {
	function login(user: string, token: string) {
		username.value = user;
		jwt.value = token;
		isLoggedIn.value = true;

		localStorage.setItem('username', user);
		localStorage.setItem('jwt', token);
	}

	function logout() {
		username.value = '';
		jwt.value = '';
		isLoggedIn.value = false;

		localStorage.setItem('username', '');
		localStorage.setItem('jwt', '');
	}

	return {
		username,
		jwt,
		isLoggedIn,
		isVerifying,
		login,
		logout,
	};
}
