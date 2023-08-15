export const useResizeHandler = (container: Ref<HTMLElement | undefined>) => {
	let initY = 0;
	let initHeight = 0;

	function initResizeDrag(event: MouseEvent) {
		event.preventDefault();
		if (!container.value || !document.defaultView) {
			throw new Error(`container or document default view not found ${{
			container: container.value,
			defaultView: document.defaultView,
		}}`);
		}

		initY = event.clientY;
		initHeight = parseInt(document.defaultView.getComputedStyle(container.value).height);
		document.addEventListener('mousemove', handleResizeDrag);
		document.addEventListener('mouseup', cleanupResizeDrag);
	}

	function handleResizeDrag(event: MouseEvent) {
		if (!container.value) {
			throw new Error('container not found');
		}
		event.preventDefault();
		container.value.style.height = `${initHeight + event.clientY - initY}px`;
	}

	function cleanupResizeDrag() {
		document.removeEventListener('mousemove', handleResizeDrag);
		document.removeEventListener('mouseup', cleanupResizeDrag);
	}

	return {
		initResizeDrag,
	};
};
