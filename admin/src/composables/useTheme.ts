const isDark = ref(false);

export const useTheme = () => {
	function toggleTheme() {
		const value = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
		isDark.value = value === 'dark';

		localStorage.setItem('color-scheme', value);
		document.documentElement.classList.toggle('dark');
	}

	return { toggleTheme, isDark };
};
