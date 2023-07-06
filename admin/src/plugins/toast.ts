import { h } from 'vue';
import type { Plugin, VNode } from 'vue';
import VToast, { type ToastVariant } from '~/components/V/VToast.vue';

export const createToast = (): Plugin => {
	let container: VNode;
	let isInitialized = false;

	function initContainer() {
		container = h('div', {
			class: 'fixed',
		});

		console.log('created container', container);

		container.component;
		document.body.appendChild(container);

		isInitialized = true;
	}

	function toast(text: string, variant?: ToastVariant) {
		!isInitialized && initContainer();
		console.log('toasting', variant);
	}

	return {
		install(app) {
			app.config.globalProperties.$toast = toast;
		},
	};
};

export type Toast = (text: string, variant?: ToastVariant) => void;
