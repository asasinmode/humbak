export default defineNuxtRouteMiddleware(async (to, _from) => {
	if (to.path.startsWith('/admin')) {
		if (!to.matched.filter(route => route.name !== 'language' && route.name !== 'language-slug').length) {
			return navigateTo('/admin/404', { replace: true });
		}

		const jwt = useState<string | undefined>('adminJwt');

		if (!jwt.value) {
			const storedJwt = localStorage.getItem('adminJwt');
			if (storedJwt) {
				try {
					const res = await $fetch('/api/admin/auth/verify', { headers: { Authorization: `Bearer ${storedJwt}` } });

					localStorage.setItem('adminJwt', res.jwt);
					jwt.value = res.jwt;
					useState('adminUsername').value = res.username;
				} catch (error) {
					console.error(error);
					localStorage.removeItem('adminJwt');
				}
			}
		}

		if (!(to.meta.noAuth ?? false) && !jwt.value) {
			return navigateTo('/admin/login');
		}

		return;
	}

	if (!to.params.language) {
		return navigateTo(`/${useRuntimeConfig().public.defaultLanguage}`);
	}
});
