const username = ref('');
const jwt = ref('');
const isLoggedIn = ref(false);

export function useAuth() {
	return { username, jwt, loggedIn: isLoggedIn };
}
