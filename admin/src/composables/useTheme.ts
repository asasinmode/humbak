const isDark = ref(document.documentElement.classList.contains('dark'));

export function useTheme() {
	function toggleTheme() {
		isDark.value = !isDark.value;
		localStorage.setItem('color-scheme', isDark.value ? 'dark' : 'light');
		document.documentElement.classList.toggle('dark', isDark.value);
	}

	return { toggleTheme, isDark };
}
