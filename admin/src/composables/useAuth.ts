const username = ref('');
const jwt = ref('');
const loggedIn = ref(false);

export function useAuth() {
	return { username, jwt, loggedIn };
}
