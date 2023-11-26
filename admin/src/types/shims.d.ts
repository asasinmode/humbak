import 'vue-router';

declare module 'vue-router' {
	// eslint-disable-next-line ts/consistent-type-definitions
	interface RouteMeta {
		layout?: any;
	}
}
