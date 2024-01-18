const username = ref('');
const jwt = ref('');
const isLoggedIn = ref(false);

export function useAuth() {
	function login(user: string, token: string) {
		username.value = user;
		jwt.value = token;
		isLoggedIn.value = true;
	}

	return { username, jwt, isLoggedIn, login };
}
