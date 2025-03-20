export default defineNuxtRouteMiddleware(async (to, _from) => {
	if (to.path.startsWith('/admin')) {
		if (!to.matched.filter(route => route.name !== 'language' && route.name !== 'language-slug').length) {
			return navigateTo('/admin/404', { replace: true });
		}

		if (!(to.meta.noAuth ?? false) && !useCookie('auth').value) {
			return navigateTo('/admin/login');
		}

		return;
	}

	if (!to.params.language) {
		return navigateTo(`/${useRuntimeConfig().public.defaultLanguage}`);
	}
});
