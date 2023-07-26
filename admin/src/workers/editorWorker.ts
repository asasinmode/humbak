import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import CssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import HtmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';

self.MonacoEnvironment = {
	getWorker(_: string, label: string) {
		if (label === 'json') {
			return new JsonWorker();
		}
		if (label === 'css') {
			return new CssWorker();
		}
		if (label === 'html') {
			return new HtmlWorker();
		}
		return new EditorWorker();
	},
};
