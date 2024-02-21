import { env } from '../../env';

export function enHomePageContent(
	[
		pagesTable,
		pagesForm,
		pagesHumbakFiles,
		pagesHumbakFileTag
	]: [
		number,
		number,
		number,
		number
	]
) {
	return `<section>
	<h1>humbak demo</h1>
	<p>This is a demo page for <strong>humbak</strong>, a blog cms. Current content is a showcase of the features available and should be reset regularly. Most of the text content was generated with <a href="https://chat.openai.com/" target="_blank" class="text-link">ChatGPT</a> and images were taken from <a href="https://unsplash.com/" target="_blank" class="text-link">Unsplash</a>.</p>
</section>

<section>
	<h2>pages</h2>

	<h3>page</h3>
	<p>The content is displayed on the, well, <a href="#" class="text-link">page</a>. you are currently viewing.</p>

	<h3>api</h3>
	<p>The page and the admin communicate with and through the <a href="${env.API_URL}" target="_blank" class="text-link">api page</a>. Besides the <a href="${env.API_URL}" target="_blank" class="text-link">home page TODO fancy underline</a> (which I recommend you check out), there isn't much there.</p>

	<h3>admin</h3>
	<p>The content managment part of the <strong>humbak</strong> cms is done on the <a href="${env.ADMIN_URL}" target="_blank" class="text-link">admin page</a>. The following section describes the features available there and contains instructions on how to use them.</p>
</section>

<section>
	<h2>features</h2>

	<h3>content</h3>
	<p>The cms' main feature is creating pages, which can be done on the <a href="${env.ADMIN_URL}" target="_blank" class="text-link">admin home page</a>. Once there, you can browse and search all the pages and edit their <em>content</em>, <em>css</em> and <em>meta</em>.</p>

	<h4>pages table</h4>
	<p>At the top of the <a href="${env.ADMIN_URL}" target="_blank" class="text-link">home page</a> are a search input and a table. The table contains all the created pages and can be filtered using the input above it. Each page has <b>edit</b> and <b>delete</b> buttons.</p>
	<div class="flex-center" style="background-color: orange; height: 40px;">
		table placeholder
	</div>

	<h4>page form</h4>
	<p>Below the table there is a form consisting of 4 text fields, the <b>editor</b> and the <b>preview box</b>. Between the <em>editor</em> and the <em>preview box</em> are <b>control buttons</b>. Going from top to bottom, the <em>control buttons</em> are: <b>editor mode select</b>, <b>content formatting</b>, <b>snippets</b> and <b>Humbak Files</b>. The last, gray button in the middle can be used to resize the <em>editor</em>. Lastly, below the editor there are the <b>clear</b> and <b>save</b> buttons.</p>
	<div class="flex-center" style="background-color: orange; height: 40px;">
		form placeholder
	</div>
	<p>Use the <b>editor mode select</b> to switch between editing page's <em>html</em>, <em>css</em> and <em>meta</em>. Note that meta should be a valid JSON array containing objects that will be mapped to meta tags, for example <code>{ "name": "description", "content": "My page's description" }</code> will create a tag <code>&lt;meta name="description" content="My page's description"&gt;.</code></p>

	<h4>humbak files</h4>
	<p>The fourth <em>control button</em>, opens the <b>humbak files dialog</b>, inside of which you can browse and search all of your files and open their preview or copy their html tag.</p>
	<div class="flex-center" style="background-color: orange; height: 40px;">
		humbak files dialog placeholder
	</div>
	<p><em>Humbak files</em> can be uploaded on the <a href="${env.ADMIN_URL}/files" target="_blank" class="text-link">files page</a> and have some special features that are described in the <a href="#files" class="text-link">humbak files</a> section. To make their features work, inside the page html you use them through a special tag <code>&ltHumbakFile fid="1"&gt;</code>. They require a special <b>fid</b> attribute that contains the target <b>humbak file's</b> id and accept all valid html attributes, such as <em>class</em> or <em>style</em>.</p>
	<div class="flex-center" style="background-color: orange; height: 40px;">
		humbak file tag placeholder
	</div>
</section>

<section>
	<h3>menu</h3>
	<p>After creating pages you can manage the menu layout on the <a href="${env.ADMIN_URL}/menu" target="_blank" class="text-link">admin menu page</a>.</p>
	<p class="indent">At the top there are: the <em>expandable and movable</em> <b>hidden pages list</b>, the <b>language select</b> and the <b>save button</b>. Below, there is the <b>menu layout editor</b> that is an interactive preview of the menu and can be used to hide and move the links around.</p>
	<div class="flex-center" style="background-color: orange; height: 40px;">
		menu page placeholder
	</div>

	<h4>example of using the menu layout editor</h4>
	<div class="flex-center" style="background-color: orange; height: 40px;">
		moving menus gif placeholder
	</div>
</section>

<section>
	<h3 id="files">files</h3>
	<p><b>Humbak files</b> can be uploaded and managed on the <a href="${env.ADMIN_URL}/files" target="_blank" class="text-link">admin files page</a>.</p>
	<p class="indent">
		In the top left corner you can find the <em>directory breadcrumbs</em> that show the current directory, the path to it and can be used to navigate directory structure. To the right of it, there are 2 buttons used to toggle between list and tile view, along with the save button.
	</p>
	<div class="flex-center" style="background-color: orange; height: 40px;">
		toggling views gif
	</div>
	<p class="indent">
		Below these are all of your files with the exception of the first item that's used to create new directories and upload new files. Besides editing files and directories' attributes you can navigate to directories or delete/move files and directories. The <b>move</b> button can either be dragged to the target directory or be clicked on to open the <b>move dialog</b>.
	</p>
	<div class="flex-center" style="background-color: orange; height: 40px;">
		moving files/directories gif
	</div>

	<h4>move dialog</h4>
	<p>The move dialog contains a list of directories. In case the directory you want to move a file/dir to is not in the same location you are currently in, you can use it to select a target dir and move a file there.</p>
	<div class="flex-center" style="background-color: orange; height: 40px;">
		moving dir using move dialog gif
	</div>
</section>

<section>
	<h3>global</h3>
	<p>While on the <a href="${env.ADMIN_URL}" target="_blank" class="text-link">admin home page</a> you can edit <em>css</em> and <em>meta</em> specific to each page, the <a href="${env.ADMIN_URL}/global" target="_blank" class="text-link">admin global page</a> is used to manage <em>css</em> and <em>meta</em> shared between all pages (with <em>meta</em> being language-specific).</p>
	<p class="indent">
		At the top you can select the <b>editor's</b> mode, choosing between <em>css</em> and <em>meta</em>, along with, in case of being in <em>meta</em> edit mode, choosing the target language. To the right of these selects are the <b>content formatting</b> and the <b>save</b> buttons. Below them is the <b>editor</b>.
	</p>
	<div class="flex-center" style="background-color: orange; height: 40px;">
		global page placeholder
	</div>
</section>

<section>
	<h3>slider</h3>
	<p>The <b>slider</b> seen at the top of all of your pages can be configured on the <a href="${env.ADMIN_URL}/slider" target="_blank" class="text-link">admin slider page</a>.</p>
	<p class="indent">
		The first row on the page contains the <b>language select</b>, the <b>slide select</b>, in order, <b>humbak files</b>, <b>slider settings</b> and <b>content formatting</b> control buttons and the <b>clear</b> and <b>save</b> buttons. Below these is the <b>editor</b>, under which is a form for managing the current slide's attributes: name, language and visibility.
	</p>
	<div class="flex-center" style="background-color: orange; height: 40px;">
		slider page placeholder
	</div>
	<p>Under the form are the <b>preview box</b>, showing the preview of currently edited slide, and a copy of the <b>slider</b> seen on the <a href="${env.PAGE_URL}" target="_blank" class="text-link">page</a>. Note that while the <em>preview box</em> updates in real time with current slide's <em>html</em>, the <em>slider</em> updates only after saving current changes.</p>
	<div class="flex-center" style="background-color: orange; height: 40px;">
		slider page previes placeholder
	</div>

	<h4>slider settings</h4>
	<p>The <em>slider settings</em> control button opens the <b>slider configuration dialog</b>. Inside it, you can adjust the slider's <b>aspect ratio</b>. Note that it should be in a format that's supported by the <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/calc" target="_blank" class="text-link">css calc function</a>.</p>
	<div class="flex-center" style="background-color: orange; height: 40px;">
		slider settings dialog placeholder
	</div>
</section>

<section>
	<h3>footer</h3>
	<p>Similarly to the <b>slider</b>, the <b>footer</b> can be edited on the <a href="${env.ADMIN_URL}/footer" target="_blank" class="text-link">admin footer page</a>.</p>
	<p class="indent">
		At the top are the <b>language select</b> and the <b>save</b> button, below which you can find an interactive preview of the footer. In the first column you can add and edit <em>emails</em>, in the second <em>phone numbers</em> and in the last the <em>location link</em>. Below these columns, in the second row, are social links that can be edited in the <b>social dialog</b>.
	</p>
	<div class="flex-center" style="background-color: orange; height: 40px;">
		footer page placeholder
	</div>

	<h4>socials dialog</h4>
	<p>Inside of the dialog you can add and edit a select few social links that will show up at the bottom of the footer.</p>
	<div class="flex-center" style="background-color: orange; height: 40px;">
		footer page socials dialog
	</div>
</section>

<section>
	<h3>settings</h3>
	<p>Lastly, on the <a href="${env.ADMIN_URL}/settings" target="_blank" class="text-link">admin settings page</a> you can log out and change your admin's account name and password.</p>
	<div class="flex-center" style="background-color: orange; height: 40px;">
		settings page placeholder
	</div>
</section>`;
}

export function plHomePageContent(
	[
		pagesTable,
		pagesForm,
		pagesHumbakFiles,
		pagesHumbakFileTag
	]: [
		number,
		number,
		number,
		number
	]
) {
	return `<section>
	<h1>humbak demo</h1>
	<p>To jest strona demo dla <strong>humbak</strong>, aplikacji CMS (content managment site - strona do zarządzania zawartością) dla bloga. Obecna zawartość przedstawia dostępną funkcjonalność CMS'a i powinna być resetowana regularnie. Większość tekstu została wygenerowana przez <a href="https://chat.openai.com/" target="_blank">ChatGPT</a>.</p>
</section>

<section>
	<h2>strony</h2>

	<h3>strona</h3>
	<p>Zawartość zarządzana przez CMS jest wyświetlana na... <a href="#" class="text-link">stronie</a>. Tej samej, którą obecnie przeglądasz.</p>

	<h3>api</h3>
	<p>Strona główna i strona admina komunikują się przez i za pomocą <a href="${env.API_URL}" target="_blank" class="text-link">strony api</a>. Poza <a href="${env.API_URL}" target="_blank" class="text-link">stroną domową TODO fancy underline</a> (którą polecam odwiedzić), nie ma na niej za wiele.</p>

	<h3>admin</h3>
	<p>Zarządzanie zawartością <strong>humbak</strong> cms'a odbywa się na <a href="${env.ADMIN_URL}" target="_blank" class="text-link">stronie admina</a>. Następujące sekcje opisują funkcjonalność dostępną na niej oraz zawierają instrukcje, jak jej używać.</p>
</section>

<section>
	<h2>funkcjonalność</h2>

	<h3>zawartość</h3>
	<p>Główną funkcjonalnością cms'a jest tworzenie stron, które odbywa się na <a href="${env.ADMIN_URL}" target="_blank" class="text-link">głównej stronie admina</a>. Możesz na niej szukać i przeglądać wszystkie strony oraz edytować ich <em>zawartość</em>, <em>css</em> i <em>metę</em>.</p>

	<h4>tabela stron</h4>
	<p>Na samej górze <a href="${env.ADMIN_URL}" target="_blank" class="text-link">strony głównej</a> znajdują się wyszukiwarka i tabela. Tabela zawiera wszystkie utworzone strony i może być filtrowana przez wyszukiwarkę nad nią. Każda strona w tabeli ma przyciski <b>edytuj</b> oraz <b>usuń</b>.</p>
	<div class="flex-center" style="background-color: orange; height: 40px;">
		table placeholder
	</div>

	<h4>formularz strony</h4>
	<p>Poniżej tabeli znajduje się formularz złożony z 4 pól tekstowych, <b>edytora</b> i <b>podglądu</b>. Pomiędzy <em>edytorem</em> i <em>podglądem</em> są <b>przyciki kontrolne</b>. Idąc od góry do dołu, <em>przyciski kontrolne</em> to: <b>wybór trybu edytora</b>, <b>formatowanie zawartości</b>, <b>snippety</b> i <b>Pliki Humbak</b>. Ostatni, szary przycisk po środku służy do zmieniani rozmiaru <em>edytora</em>. Na samym końcu, poniżej <b>edytora</b> są przyciski <b>wyczyść</b> i <b>zapisz</b>.</p>
	<div class="flex-center" style="background-color: orange; height: 40px;">
		form placeholder
	</div>
	<p>Użyj <b>wyboru trybu edytora</b> do zmieniania między edytowaniem <em>html</em>, <em>css</em> i <em>mety</em> strony. W przypadku edytowania <em>mety</em>, zawartość powinna być prawidłową JSON listą zawierającą obiekty, które zostaną zamienione w tagi meta. Przykładowo <code>{ "name": "description", "content": "Opis mojej strony" }</code> utworzy tag <code>&lt;meta name="description" content="Opis mojej strony"&gt;</code>.</p>

	<h4>pliki humbak</h4>
	<p>Czwarty <em>przycisk kontrolny</em>, otwiera <b>dialog Humbak Plików</b>, w środku którego możesz wyszukiwać i przeglądać wszystkie pliki, otwierać ich podglądy oraz kopiować ich tagi HTML.</p>
	<div class="flex-center" style="background-color: orange; height: 40px;">
		humbak files dialog placeholder
	</div>
	<p><em>Humbak pliki</em> mogą być wgrywane na <a href="${env.ADMIN_URL}/files" target="_blank" class="text-link">stronie plików admina</a> i mają specjalne właściwości opisane w sekcji <a href="#files" class="text-link">pliki humbak</a>. Żeby ich funkcjonalność działała, w html zawartości muszą one być używane za pomocą specjalnego tagu <code>&ltHumbakFile fid="1"&gt;</code>. Te tagi wymagają atrybutu <b>fid</b> który zawiera id docelowego <b>pliku humbak</b> i akceptują wszystkie poprawne html atrybuty, takie jak <em>class</em> lub <em>style</em>.</p>
	<div class="flex-center" style="background-color: orange; height: 40px;">
		humbak file tag placeholder
	</div>
</section>

<section>
	<h3>menu</h3>
	<p>Po utworzeniu stron możesz zarządzać ułożeniem menu na <a href="${env.ADMIN_URL}/menu" target="_blank" class="text-link">stronie menu admina</a>.</p>
	<p>Na samej górze znajdują się: <em>rozszerzana i ruchoma</em> <b>lista ukrytych stron</b>, <b>wybór języka</b> i <b>przycisk zapisz</b>. Poniżej jest <b>edytor układu menu</b> będący interaktywnym podglądem menu, który może być użyty do chowania i zmieniania pozycji linków menu. Żeby schować link należy przeciągnąć go do <b>listy ukrytych stron</b>. Podobnie, żeby pokazać link należy go przeciągnąć z tej samej listy do <b>edytora układu</b>.</p>
	<div class="flex-center" style="background-color: orange; height: 40px;">
		menu page placeholder
	</div>

	<h4>przykład używania edytora układu menu</h4>
	<div class="flex-center" style="background-color: orange; height: 40px;">
		moving menus gif placeholder
	</div>
</section>

<section>
	<h3>pliki</h3>
	<p><b>Pliki humbak</b> mogą być wgrywane i zarządzane na <a href="${env.ADMIN_URL}/files" target="_blank" class="text-link">stronie plików admina</a>.</p>
	<p class="indent">
		W lewym górnym rogu znajdują się <em>okruchy folderów</em>, które pokazują twój obecny folder, jego ścieżkę i mogą być użyte do nawigowania między folderami. Na prawo od nich są 2 przyciski do zmieniania widoku pomiędzy widokiem listy a kafelkami. Obok nich jest przycisk <b>zapisz</b>.
	</p>
	<div class="flex-center" style="background-color: orange; height: 40px;">
		toggling views gif
	</div>
	<p class="indent">
		Poniżej powyższych wylistowane są wszystkie twoje pliki, z wyjątkiem pierwszego elementu, który służy do tworzenia nowych folderów i wgrywania nowych plików. Poza edytowaniem atrybutów plików i folderów możesz nawigować do poszczególnych folderów oraz usuwać/edytować pliki i foldery. Przycisk <b>przesuń</b> może być albo przeciągnięty i upuszczony do konkretnego folderu, albo kliknięty na żeby otworzyć <b>dialog przesuwania</b>.
	</p>
	<div class="flex-center" style="background-color: orange; height: 40px;">
		moving files/directories gif
	</div>
	<p>Zaletą używania <b>plików humbak</b> jest fakt, że zmiana tytułu/atrybutu alt lub przemieszczenie go jest na bieżąco śledzone i wszystkie strony i slajdy używane go zostaną zaktualizowane z najnowszymi danymi.</p>

	<h4>dialog przesuwania</h4>
	<p>Dialog przesuwania zawiera listę folderów. W przypadku, kiedy folder, do którego chcesz przesunąć inny plik/folder jest w innej, niż obecna, lokacji, możesz użyć go do wybrania docelowego folderu i przesunięcia do niego pliku.</p>
	<div class="flex-center" style="background-color: orange; height: 40px;">
		moving dir using move dialog gif
	</div>
</section>

<section>
	<h3>global</h3>
	<p>Kiedy na <a href="${env.ADMIN_URL}" target="_blank" class="text-link">stronie głównej admina</a> możesz edytować <em>css</em> i <em>metę</em> poszczególnych stron, <a href="${env.ADMIN_URL}/global" target="_blank" class="text-link">strona global admina</a> jest używana do edytowania <em>css</em> i <em>mety</em> dzielonej między wszystkimi stronami (z wyjątkiem <em>mety</em>, która jest dzielona między wszystkimi stronami o tym samym języku).</p>
	<p class="indent">
		At the top you can select the <b>editor's</b> mode, choosing between <em>css</em> and <em>meta</em>, along with, in case of being in <em>meta</em> edit mode, choosing the target language. To the right of these selects are the <b>content formatting</b> and the <b>save</b> buttons. Below all of that is the <b>editor</b>.
	</p>
	<p class="indent">
		Na samej górze możesz wybrać tryb <b>edytora</b>, wybierając pomiędzy <em>css</em> i <em>metą</em>. Dodatkowo, w przypadku trybu edytora będącego <em>metą</em>, możesz wybrać język, dla którego jest ona zmieniana. Na prawo od tych dwóch pól wyboru są przyciski <b>formatowania kontentu</b> i <b>zapisywania</b>. Poniżej tych elementów znajduje się <b>edytor</b>.
	</p>
	<div class="flex-center" style="background-color: orange; height: 40px;">
		global page placeholder
	</div>
</section>

<section>
	<h3>slider</h3>
	<p><b>Slider</b> znajdujący się na górze wszystkich stron może być konfigurowany na <a href="${env.ADMIN_URL}/slider" target="_blank" class="text-link">stronie slider admina</a>.</p>
	<p class="indent">
		Pierwszy rząd na stronie zawiera <b>wybór języka</b>, <b>wybór slajdu</b>, kolejno przyciski kontrolne <b>pliki humbak</b>, <b>ustawienia slidera</b> <b>formatowanie zawartości</b> oraz przyciski <b>wyczyść</b> i <b>zapisz</b>. Poniżej tych wszystkich elementów znajduje się <b>edytor</b>, pod którym jest formularz do zarządzania atrybutami obecnego slajdu: nazwa, język i widoczność.
	</p>
	<div class="flex-center" style="background-color: orange; height: 40px;">
		slider page placeholder
	</div>
	<p>Poniżej formularza są <b>podgląd</b>, pokazujący wygląd obecnie edytowanego slajdu i <b>slider</b>, będący kopią slidera widocznego na <a href="${env.PAGE_URL}" target="_blank" class="text-link">stronie głównej</a>. O ile <em>podgląd</em> aktualizuje się na bieżąco z <em>html'em</em> obecnego slajdu, to <em>slider</em> aktualizuje się dopiero po zapisaniu zmian.</p>
	<div class="flex-center" style="background-color: orange; height: 40px;">
		slider page previews placeholder
	</div>

	<h4>ustawienia slidera</h4>
	<p>Przycisk kontrolny <em>ustawień slidera</em> otwiera <b>dialog konfiguracji slidera</b>. W środku dialogu możesz zmienić <b>proporcje</b> slidera. Format wartości powinien być w formie wspieranej przez <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/calc" target="_blank" class="text-link">funkcję calc css</a>.</p>
	<div class="flex-center" style="background-color: orange; height: 40px;">
		slider settings dialog placeholder
	</div>
</section>

<section>
	<h3>stopka</h3>
	<p>Podobnie do <b>slidera</b>, <b>stopka</b> może być edytowana na <a href="${env.ADMIN_URL}/footer" target="_blank" class="text-link">stronie stopka admina</a>.</p>
	<p class="indent">
		Na górze strony znajduje się <b>wybór języka</b> i przycisk <b>zapisz</b>, poniżej których jest interaktywny podgląd stopki. W pierwszej kolumnie można dodawać i edytować emaile, w drugiej numery telefonu a w ostatniej link lokacji. Poniżej tych kolumn, w drugim rzędzie znajdują się linki do sociali, które mogą być edytowane w <b>dialog sociali</b>.
	</p>
	<div class="flex-center" style="background-color: orange; height: 40px;">
		footer page placeholder
	</div>

	<h4>dialog sociali</h4>
	<p>W środku dialogu możesz dodawać i edytować kilka wybranych social linków, które pokażą się na dole stopki.</p>
	<div class="flex-center" style="background-color: orange; height: 40px;">
		footer page socials dialog
	</div>
</section>

<section>
	<h3>ustawienia</h3>
	<p>Na samym końcu, na <a href="${env.ADMIN_URL}/settings" target="_blank" class="text-link">stronie ustawień admina</a> możesz się wylogować lub zmienić swoją nazwę użytkownika i hasło.</p>
</section>
`;
}

export function enOceansPageContent([imgId1, imgId2, imgId3, imgId4]: [number, number, number, number]) {
	return `<section>
	<h1>oceans</h1>
	<p>Oceans, expansive aqueous realms that cover approximately 71% of the Earth's surface, stand as colossal reservoirs of life and intrigue. These vast bodies of saltwater, comprising the Pacific, Atlantic, Indian, Southern, and Arctic Oceans, play a pivotal role in shaping the planet's climate and supporting an astonishing diversity of ecosystems. Spanning intercontinental distances, oceans serve as conduits of global connectivity, facilitating the exchange of heat, moisture, and nutrients across their sprawling expanses.</p>

	<div class="split-container-3">
		<div class="described-image">
			<HumbakFile fid="${imgId1}"></HumbakFile>
			<p><a href="https://unsplash.com/photos/five-birds-flying-on-the-sea-OD9EOzfSOh0" target="_blank" class="text-black text-link">an ocean</a></p>
		</div>
		<div class="described-image">
			<HumbakFile fid="${imgId2}"></HumbakFile>
			<p><a href="https://unsplash.com/photos/body-of-water-under-bright-sky-69lLaqQ6bQU" target="_blank" class="text-black text-link">also an ocean</a></p>
		</div>
		<div class="described-image">
			<HumbakFile fid="${imgId3}"></HumbakFile>
			<p><a href="https://unsplash.com/photos/seashore-DA_tplYgTow" target="_blank" class="text-black text-link">an ocean too</a></p>
		</div>
	</div>

	<p class="indent">Beneath the glistening surface, oceans harbor a mysterious and intricate tapestry of marine life, ranging from microscopic plankton to majestic whales. Their depths house hidden realms and abyssal plains, where enigmatic creatures thrive in conditions unfathomable to terrestrial life. Oceans also serve as crucibles of biodiversity, nurturing vibrant coral reefs and underwater landscapes that teem with an abundance of flora and fauna. Moreover, they act as dynamic theaters of geological processes, with tectonic plates colliding and diverging beneath their surface, shaping coastlines and giving rise to underwater mountain ranges.</p>

	<a href="https://unsplash.com/photos/school-of-fish-in-body-of-water-9y7y26C-l4Y" target="_blank" class="block my-4">
		<HumbakFile fid="${imgId4}"></HumbakFile>
	</a>

	<p class="indent">The oceans' influence extends far beyond their physical boundaries, exerting a profound impact on weather patterns, atmospheric composition, and the overall health of our planet. As humanity grapples with the imperative to safeguard these aquatic giants from the pressures of climate change and overexploitation, a deeper understanding of their intricate ecosystems becomes essential. In essence, oceans encapsulate the essence of Earth's interconnected and dynamic nature, serving as both cradles of life and silent guardians of our planet's delicate equilibrium.</p>
</section>`;
}

export function plOceansPageContent([imgId1, imgId2, imgId3, imgId4]: [number, number, number, number]) {
	return `<section>
	<h1>oceany</h1>
	<p>Oceany, rozległe krainy wodne obejmujące około 71% powierzchni Ziemi, stanowią kolosalne zbiorniki życia i fascynacji. Te ogromne masy solnej wody, obejmujące Pacyfik, Atlantyk, Indyjski, Południowy i Arktyczny Ocean, odgrywają kluczową rolę w kształtowaniu klimatu planety i wspieraniu zdumiewającej różnorodności ekosystemów. Rozciągając się na międzykontynentalne odległości, oceany pełnią rolę korytarzy globalnego połączenia, ułatwiając wymianę ciepła, wilgoci i składników odżywczych na ich rozległych obszarach.</p>

	<div class="split-container-3">
		<div class="described-image">
			<HumbakFile fid="${imgId1}"></HumbakFile>
			<p><a href="https://unsplash.com/photos/five-birds-flying-on-the-sea-OD9EOzfSOh0" target="_blank" class="text-black text-link">ocean</a></p>
		</div>
		<div class="described-image">
			<HumbakFile fid="${imgId2}"></HumbakFile>
			<p><a href="https://unsplash.com/photos/body-of-water-under-bright-sky-69lLaqQ6bQU" target="_blank" class="text-black text-link">też ocean</a></p>
		</div>
		<div class="described-image">
			<HumbakFile fid="${imgId3}"></HumbakFile>
			<p><a href="https://unsplash.com/photos/seashore-DA_tplYgTow" target="_blank" class="text-black text-link">również ocean</a></p>
		</div>
	</div>

	<p>Pod błyszczącą powierzchnią oceany kryją tajemniczą i złożoną mozaikę życia morskiego, począwszy od mikroskopijnych planktonów po majestatyczne wieloryby. Ich głębiny skrywają ukryte królestwa i równiny abysalne, gdzie enigmatyczne istoty rozwijają się w warunkach niepojętych dla życia lądowego. Oceany pełnią także rolę kuźni bioróżnorodności, pielęgnując kolorowe rafy koralowe i podwodne krajobrazy, które pulsuje obfitością flory i fauny. Ponadto, działają jako dynamiczne areny procesów geologicznych, gdzie płyty tektoniczne zderzają się i oddzielają pod ich powierzchnią, kształtując linie brzegowe i powodując powstanie podwodnych łańcuchów górskich.</p>

	<a href="https://unsplash.com/photos/school-of-fish-in-body-of-water-9y7y26C-l4Y" target="_blank" class="block my-4">
		<HumbakFile fid="${imgId4}"></HumbakFile>
	</a>

	<p>Wpływ oceanów rozciąga się daleko poza ich fizyczne granice, wywierając głęboki wpływ na wzorce pogodowe, skład atmosfery i ogólną kondycję naszej planety. W miarę jak ludzkość boryka się z koniecznością ochrony tych wodnych gigantów przed wpływami zmian klimatycznych i nadmiernego eksploatowania, staje się istotne głębsze zrozumienie ich złożonych ekosystemów. W istocie, oceany uosabiają istotę złożonej i spójnej natury Ziemi, pełniąc jednocześnie rolę kołyski życia i cichych strażników delikatnej równowagi naszej planety.</p>
</section>`;
}

export function enSeasPageContent([imgId1, imgId2]: [number, number]) {
	return `<section>
	<h1>seas</h1>
	<p>Seas, the dynamic expanses of saltwater that cradle our planet, are vital components of Earth's intricate tapestry. Unlike oceans, seas are smaller, partially enclosed by land, and often characterized by unique geological and ecological features. With an array of names such as the Mediterranean, Caribbean, and Coral Seas, these bodies of water play a pivotal role in shaping regional climates and fostering diverse ecosystems.</p>
	<p class="indent">Seas are teeming hubs of marine life, harboring a rich biodiversity that adapts to the specific conditions of each sea's environment. From the bustling shallows to the mysterious depths, these aquatic realms host a mesmerizing array of species, ranging from vibrant coral reefs to elusive deep-sea creatures. The intricate interplay between tides, currents, and underwater topography creates a mosaic of habitats, providing a home for an astonishing variety of flora and fauna.</p>

	<div class="split-container-2">
		<a href="https://unsplash.com/photos/photography-of-seashore-during-sunset-FGvRZ-BeCKo" target="_blank">
			<HumbakFile fid="${imgId1}"></HumbakFile>
		</a>
		<a href="https://unsplash.com/photos/body-of-water-near-mountains-at-daytime-F-7HklW7be8" target="_blank">
			<HumbakFile fid="${imgId2}"></HumbakFile>
		</a>
	</div>

	<p>Beyond their ecological significance, seas hold historical and cultural importance, serving as conduits for trade, exploration, and human settlement throughout millennia. As humanity faces the challenges of climate change and environmental conservation, understanding and protecting these intricate marine environments becomes paramount. Seas, with their ever-shifting dynamics and unique characteristics, contribute not only to the biodiversity of our planet but also to the rich narrative of Earth's history and the ongoing interplay between nature and civilization.</p>
</section>`;
}

export function plSeasPageContent([imgId1, imgId2]: [number, number]) {
	return `<section>
	<h1>morza</h1>
	<p>Morza, dynamiczne przestrzenie słonej wody, które otaczają naszą planetę, są istotnymi składnikami złożonej tkaniny Ziemi. W przeciwieństwie do oceanów, morza są mniejsze, częściowo zamknięte przez ląd, często charakteryzują się unikalnymi cechami geologicznymi i ekologicznymi. O takich nazwach jak Morze Śródziemne, Karaibskie i Koralowe, te obszary wodne odgrywają kluczową rolę w kształtowaniu regionalnych klimatów i wspieraniu różnorodnych ekosystemów.</p>
	<p class="indent">Morza są pulsem życia morskiego, z bogatą bioróżnorodnością, która dostosowuje się do konkretnych warunków środowiska każdego morza. Od ruchliwych płycizn po tajemnicze głębiny, te akwatyczne krainy gościć w sobie olśniewającą gamę gatunków, począwszy od kolorowych raf koralowych po nieuchwytne stworzenia głębin morskich. Złożona interakcja pomiędzy pływami, prądami i podwodną topografią tworzy mozaikę siedlisk, zapewniając schronienie dla zdumiewającej różnorodności flory i fauny.</p>

	<div class="split-container-2">
		<a href="https://unsplash.com/photos/photography-of-seashore-during-sunset-FGvRZ-BeCKo" target="_blank">
			<HumbakFile fid="${imgId1}"></HumbakFile>
		</a>
		<a href="https://unsplash.com/photos/body-of-water-near-mountains-at-daytime-F-7HklW7be8" target="_blank">
			<HumbakFile fid="${imgId2}"></HumbakFile>
		</a>
	</div>

	<p>Pośród fal i przemieszczających się piasków, morza splatają opowieści o handlu, eksploracji i osadnictwie ludzkim, wytwarzając historyczne i kulturowe znaczenie na ich brzegach. W miarę jak ludzkość boryka się z wyzwaniami związanymi z zmianami klimatu i ochroną środowiska, zrozumienie i ochrona tych złożonych środowisk morskich stają się priorytetem. Morza, ze swoją wiecznie zmieniającą się dynamiką i unikalnymi cechami, przyczyniają się nie tylko do bioróżnorodności naszej planety, lecz także do bogatej narracji historii Ziemi oraz trwającej interakcji między naturą a cywilizacją. W eksploracji mórz wyruszamy w podróż, która łączy nas zarówno z starożytnymi opowieściami przeszłości, jak i z pilnymi wysiłkami w dziedzinie ochrony kształtującej przyszłość.</p>
</section>`;
}

export function enLakesPageContent([imgId1, imgId2, imgId3, imgId4, imgId5, imgId6]: [number, number, number, number, number, number]) {
	return `<section>
	<h1>lakes</h1>
	<p>Lakes, serene and often nestled within the embrace of terrestrial landscapes, stand as tranquil reservoirs that dot the Earth's surface. Distinguished by their relative size and enclosed nature, lakes vary from expansive bodies, such as the Great Lakes, to smaller, more intimate water features scattered across the globe. Their presence contributes not only to the aesthetic beauty of landscapes but also plays a crucial role in ecological processes and human activities.</p>
	<p class="indent">These freshwater expanses serve as crucial habitats for a diverse array of flora and fauna, creating thriving ecosystems within their depths and along their shores. Lakes support an intricate balance of life, offering refuge to aquatic plants, fish, and a myriad of waterfowl. The interconnectedness of lakes with surrounding ecosystems is evident as they receive inputs from rivers and streams, influencing water quality and fostering biodiversity.</p>

	<div class="described-image">
		<HumbakFile fid="${imgId1}"></HumbakFile>
		<p><a href="https://unsplash.com/photos/aerial-photography-of-islands-surrounded-with-body-of-water-ZLLwL9bKlnk" target="_blank" class="text-link text-black">many lakes</a></p>
	</div>

	<p>Moreover, lakes possess cultural significance and often become focal points for human settlement and recreation. Throughout history, communities have been drawn to the shores of lakes, relying on them as sources of water, transportation, and sustenance. Today, lakes continue to be cherished for their recreational opportunities, providing havens for boating, fishing, and contemplative moments amidst nature's tranquility.</p>

	<div class="split-container-3">
		<a href="https://unsplash.com/photos/green-grasses-near-body-of-water-with-mountain-range-in-vicinity-sC-BXbi9ajw" target="_blank">
			<HumbakFile fid="${imgId2}"></HumbakFile>
		</a>
		<a href="https://unsplash.com/photos/lake-beside-hills-yTmvgqhT2m0" target="_blank">
			<HumbakFile fid="${imgId3}"></HumbakFile>
		</a>
		<a href="https://unsplash.com/photos/brown-rocks-beside-blue-lake-near-white-snowy-mountain-at-daytime-TV1jBQWiHwU" target="_blank">
			<HumbakFile fid="${imgId4}"></HumbakFile>
		</a>
	</div>

	<p>As humanity grapples with the challenges of environmental conservation, lakes underscore the need for sustainable practices to preserve these vital water bodies. Whether serving as reflective mirrors amidst mountain landscapes or contributing to the vibrancy of urban environments, lakes embody both the delicate balance of natural ecosystems and the enduring connection between humans and their watery havens.</p>

	<div class="split-container-2">
		<div class="described-image">
			<HumbakFile fid="${imgId5}"></HumbakFile>
			<p><a href="https://unsplash.com/photos/calm-body-of-water-near-mountain-YR-oXTkOtLo" target="_blank" class="text-link text-black">a lake</a></p>
		</div>
		<div class="described-image">
			<HumbakFile fid="${imgId6}"></HumbakFile>
			<p><a href="https://unsplash.com/photos/lake-near-mountain-under-blue-sky-during-daytime-jAAk__SlP8U" target="_blank" class="text-link text-black">other lake</a></p>
		</div>
	</div>
</section>`;
}

export function plLakesPageContent([imgId1, imgId2, imgId3, imgId4, imgId5, imgId6]: [number, number, number, number, number, number]) {
	return `<section>
	<h1>lakes</h1>
	<p>Jeziora, spokojne i często osadzone w objęciach krajobrazów lądowych, stanowią spokojne zbiorniki wodne, zdobiące powierzchnię Ziemi. Wyróżniające się swoim względnym rozmiarem i zamkniętym charakterem, jeziora różnią się od rozległych zbiorników, takich jak Wielkie Jeziora, po mniejsze, bardziej kameralne akweny rozsiane po całym globie. Ich obecność przyczynia się nie tylko do estetycznego piękna krajobrazów, ale także odgrywa kluczową rolę w procesach ekologicznych i ludzkich działalnościach.</p>
	<p class="indent">Te słodkowodne obszary pełnią istotne funkcje jako siedliska różnorodnych form flory i fauny, tworząc kwitnące ekosystemy zarówno w głębiach, jak i wzdłuż brzegów. Jeziora wspierają złożoną równowagę życia, oferując schronienie dla roślin wodnych, ryb i licznych gatunków ptactwa wodnego. Wzajemne powiązania jezior z otaczającymi ekosystemami są widoczne, gdy otrzymują dopływy z rzek i strumieni, wpływając na jakość wody i wspierając różnorodność biologiczną.</p>

	<div class="described-image">
		<HumbakFile fid="${imgId1}"></HumbakFile>
		<p><a href="https://unsplash.com/photos/aerial-photography-of-islands-surrounded-with-body-of-water-ZLLwL9bKlnk" target="_blank" class="text-link text-black">many lakes</a></p>
	</div>

	<p>Ponadto jeziora posiadają znaczenie kulturowe i często stają się punktami centralnymi osadnictwa ludzkiego oraz miejscami rekreacji. Na przestrzeni historii społeczności przyciągały brzegi jezior, polegając na nich jako źródłach wody, środkach transportu i źródłach utrzymania. Dziś jeziora wciąż są cenione ze względu na swoje możliwości rekreacyjne, stanowiąc ostoję dla żeglugi, wędkarstwa i refleksyjnych chwil wśród spokoju natury.</p>

	<div class="split-container-3">
		<a href="https://unsplash.com/photos/aerial-photography-of-islands-surrounded-with-body-of-water-ZLLwL9bKlnk" target="_blank">
			<HumbakFile fid="${imgId2}"></HumbakFile>
		</a>
		<a href="https://unsplash.com/photos/lake-beside-hills-yTmvgqhT2m0" target="_blank">
			<HumbakFile fid="${imgId3}"></HumbakFile>
		</a>
		<a href="https://unsplash.com/photos/brown-rocks-beside-blue-lake-near-white-snowy-mountain-at-daytime-TV1jBQWiHwU" target="_blank">
			<HumbakFile fid="${imgId4}"></HumbakFile>
		</a>
	</div>

	<p>W obliczu wyzwań związanych z ochroną środowiska, jeziora podkreślają konieczność praktyk zrównoważonych, mających na celu zachowanie tych istotnych zbiorników wodnych. Czy to jako odbicia górskich krajobrazów czy elementy wzbogacające środowiska miejskie, jeziora łączą w sobie zarówno delikatną równowagę naturalnych ekosystemów, jak i trwałe powiązanie między ludźmi a ich wodnymi oazami.</p>

	<div class="split-container-2">
		<div class="described-image">
			<HumbakFile fid="${imgId5}"></HumbakFile>
			<p><a href="https://unsplash.com/photos/calm-body-of-water-near-mountain-YR-oXTkOtLo" target="_blank" class="text-link text-black">a lake</a></p>
		</div>
		<div class="described-image">
			<HumbakFile fid="${imgId6}"></HumbakFile>
			<p><a href="https://unsplash.com/photos/lake-near-mountain-under-blue-sky-during-daytime-jAAk__SlP8U" target="_blank" class="text-link text-black">other lake</a></p>
		</div>
	</div>
</section>`;
}

export function enAtlanticPageContent([imgId1, imgId2]: [number, number]) {
	return `<section>
	<h1>Atlantic</h1>
	<p>The Atlantic Ocean, a vast expanse of saltwater that stretches between the
		<ul>
			<li>Americas</li>
			<li>Europe</li>
			<li>Africa</li>
			<li>Antarctica</li>
		</ul>
	commands a position of profound significance in the global maritime landscape. As the second-largest ocean on Earth, the Atlantic encompasses a diverse range of climates, ecosystems, and marine life, contributing to its reputation as a dynamic and influential force in shaping the planet's interconnected systems.</p>

	<div class="described-image">
		<HumbakFile fid="${imgId1}"></HumbakFile>
		<p><a href="https://science4fun.info/atlantic-ocean/" target="_blank" class="text-black text-link">atlantic ocean map</a></p>
	</div>

	<p>The Atlantic Ocean serves as a conduit for complex oceanic currents and circulation patterns, influencing weather patterns and regulating the planet's climate. Its strategic location has historically facilitated exploration, trade, and cultural exchange among continents, forging connections that have shaped human history. The Atlantic, with its mighty currents and powerful storms, has witnessed centuries of seafaring adventures, playing a crucial role in maritime exploration and trade routes.</p>

	<a href="https://unsplash.com/photos/boat-on-sea-under-white-clouds-8eFbe3jQZ7Y" target="_blank" class="block my-4">
		<HumbakFile fid="${imgId2}"></HumbakFile>
	</a>

	<p>Beneath the surface, the Atlantic Ocean harbors a rich tapestry of marine biodiversity, from the vibrant coral reefs of the Caribbean to the open ocean habitats supporting diverse fish species. The underwater landscape features expansive abyssal plains, submarine mountain ranges, and deep-sea trenches, adding to the ocean's geological complexity. Additionally, the Atlantic plays a pivotal role in the migratory routes of marine species, including whales, dolphins, and various fish, highlighting its ecological importance.</p>

	<p class="indent">As the global community faces challenges related to climate change and environmental conservation, the Atlantic Ocean emerges as a focal point for scientific research and international cooperation. Efforts to understand and protect this immense marine expanse are crucial for preserving the delicate balance of oceanic ecosystems and ensuring the sustained health of our planet. The Atlantic Ocean, with its vastness and diversity, continues to captivate the human imagination while serving as a barometer of the Earth's environmental well-being.</p>
</section>`;
}

export function plAtlanticPageContent([imgId1, imgId2]: [number, number]) {
	return `<section>
	<h1>Atlantyk</h1>
	<p>Ocean Atlantycki, rozległa przestrzeń słonej wody rozciągająca się między
		<ul>
			<li>Amerykami</li>
			<li>Europą</li>
			<li>Afryką</li>
			<li>Antarktydą</li>
		</ul>
	zajmuje pozycję o głębokim znaczeniu w globalnym krajobrazie morskim. Jako drugi co do wielkości ocean na Ziemi, Atlantyk obejmuje różnorodne klimaty, ekosystemy i życie morskie, przyczyniając się do swojej reputacji dynamicznej i wpływowej siły kształtującej złożone systemy naszej planety.</p>

	<div class="described-image">
		<HumbakFile fid="${imgId1}"></HumbakFile>
		<p><a href="https://science4fun.info/atlantic-ocean/" target="_blank" class="text-black text-link">mapa oceanu atlantyckiego</a></p>
	</div>

	<p>Ocean Atlantycki pełni funkcję kanału dla złożonych prądów oceanicznych i cyrkulacyjnych wzorców, wpływając na układy pogodowe i regulując klimat planety. Jego strategiczna lokalizacja historycznie ułatwiała eksplorację, handel i wymianę kulturową między kontynentami, kształtując powiązania, które wpłynęły na historię ludzkości. Atlantyk, z jego potężnymi prądami i gwałtownymi burzami, był świadkiem wieków morskich przygód, odgrywając istotną rolę w eksploracji morskiej i trasach handlowych.</p>

	<a href="https://unsplash.com/photos/boat-on-sea-under-white-clouds-8eFbe3jQZ7Y" target="_blank" class="block my-4">
		<HumbakFile fid="${imgId2}"></HumbakFile>
	</a>

	<p>Pod powierzchnią Oceanu Atlantyckiego skrywa się bogata mozaika bioróżnorodności morskiej, począwszy od kolorowych raf koralowych Karaibów po otwarte habitaty wspierające różnorodne gatunki ryb. Podwodny krajobraz obejmuje rozległe równiny abysalne, podmorskie łańcuchy górskie i rowy oceaniczne, dodając do geologicznej złożoności oceanu. Ponadto Atlantyk odgrywa kluczową rolę w trasach migracyjnych gatunków morskich, w tym wielorybów, delfinów i różnorodnych gatunków ryb, podkreślając swoje znaczenie ekologiczne.</p>

	<p class="indent">W obliczu wyzwań związanych ze zmianami klimatycznymi i ochroną środowiska, Ocean Atlantycki staje się punktem centralnym dla badań naukowych i współpracy międzynarodowej. Dążenia do zrozumienia i ochrony tej ogromnej przestrzeni morskiej są kluczowe dla zachowania delikatnej równowagi oceanicznych ekosystemów i zapewnienia trwałego zdrowia naszej planety. Ocean Atlantycki, ze swoją ogromnością i różnorodnością, nadal fascynuje ludzką wyobraźnię, jednocześnie pełniąc rolę barometru dobrostanu środowiska na Ziemi.</p>
</section>`;
}

export function enPacificPageContent([imgId1, imgId2]: [number, number]) {
	return `<section>
	<h1>Pacific</h1>
	<p>The Pacific Ocean, Earth's largest and deepest ocean, sprawls across the globe, embracing vast expanses between Asia and Australia, the Americas, and Antarctica. As a colossal water body, the Pacific plays a pivotal role in shaping the planet's climate, marine ecosystems, and cultural interactions. Its sheer size and expanse make it a dynamic force with far-reaching impacts on both the natural world and human societies.</p>

	<p class="indent">Stretching from the Arctic to the Antarctic, the Pacific Ocean encompasses an array of climatic zones, from the icy waters of the North to the temperate and tropical regions near the Equator. This diversity fosters a rich tapestry of marine life, ranging from the iconic species of the Arctic seas to the vibrant coral reefs of the South Pacific. The ocean's currents, such as the powerful North and South Pacific Gyres, influence global weather patterns, contributing to the intricate dance of atmospheric and oceanic processes.</p>

	<a href="https://science4fun.info/pacific-ocean/" target="_blank" class="block my-4">
		<HumbakFile fid="${imgId1}"></HumbakFile>
	</a>

	<p>Throughout history, the Pacific has been a conduit for exploration, trade, and cultural exchange. The vastness of its waters has connected continents and facilitated the movement of peoples, goods, and ideas. Islands scattered across the Pacific have unique ecosystems and cultures, reflecting the resilience and adaptability of the communities that call these remote places home.</p>

	<p class="indent">The Pacific Ocean, with its iconic features like the Great Barrier Reef, the Mariana Trench, and countless islands, harbors a staggering biodiversity. From the humpback whales that traverse its vastness to the microscopic plankton that form the basis of marine food webs, the Pacific is a living testament to the interconnectedness of life on Earth.</p>

	<div class="described-image">
		<HumbakFile fid="${imgId2}"></HumbakFile>
		<p><a href="https://unsplash.com/photos/green-coral-reef-under-water-vJGsAdVDaRw" target="_blank" class="text-black text-link">coral reef</a></p>
	</div>

	<p>In the face of contemporary challenges such as climate change, overfishing, and plastic pollution, the Pacific Ocean stands as a critical focal point for global conservation efforts. Understanding and safeguarding this immense marine realm are imperative for maintaining the delicate balance of the planet's ecosystems and ensuring the sustainable coexistence of nature and humanity. The Pacific Ocean, with its majesty and significance, remains a source of awe and inspiration, embodying the vastness and mysteries of our planet's blue expanse.</p>
</section>`;
}

export function plPacificPageContent([imgId1, imgId2]: [number, number]) {
	return `<section>
	<h1>Pacyfik</h1>
	<p>Pacyfik, największy i najgłębszy ocean na Ziemi, rozciąga się po całym globie, obejmując rozległe przestrzenie między Azją i Australią, Amerykami a Antarktydą. Jako kolosalne zbiornisko wodne, Pacyfik odgrywa kluczową rolę w kształtowaniu klimatu planety, ekosystemów morskich i interakcji kulturowych. Jego ogromny rozmiar i obszar sprawiają, że jest dynamiczną siłą z oddziaływaniem o dalekim zasięgu zarówno na świat przyrody, jak i społeczeństwo ludzkie.</p>

	<p class="indent">Rozciągający się od Arktyki po Antarktydę, Ocean Spokojny obejmuje szereg stref klimatycznych, od lodowatych wód na północy po umiarkowane i tropikalne obszary blisko równika. Ta różnorodność sprzyja bogatej mozaice życia morskiego, począwszy od ikonicznych gatunków mórz arktycznych po kolorowe rafy koralowe na południowym Pacyfiku. Prądy oceaniczne, takie jak potężne giętki północny i południowy Pacyfik, wpływają na globalne wzorce pogodowe, przyczyniając się do skomplikowanego tańca procesów atmosferycznych i oceanicznych.</p>

	<a href="https://science4fun.info/pacific-ocean/" target="_blank" class="block my-4">
		<HumbakFile fid="${imgId1}"></HumbakFile>
	</a>

	<p>Na przestrzeni historii Pacyfik był kanałem dla eksploracji, handlu i wymiany kulturowej. Ogrom jego wód połączył kontynenty i ułatwił przemieszczanie się ludzi, towarów i idei. Wyspy rozsiane po Pacyfiku posiadają unikalne ekosystemy i kultury, odzwierciedlając odporność i adaptacyjność społeczności, które nazywają te odległe miejsca domem.</p>

	<p class="indent">Pacyfik, ze swoimi ikonicznymi cechami, takimi jak Wielka Rafa Koralowa, Rów Mariański i niezliczone wyspy, kryje w sobie zdumiewającą bioróżnorodność. Od wielorybów, które przemierzają jego obszar po mikroskopijne planktony, stanowiące podstawę morskich łańcuchów pokarmowych, Pacyfik jest żywym świadectwem wzajemnych powiązań życia na Ziemi.</p>

	<div class="described-image">
		<HumbakFile fid="${imgId2}"></HumbakFile>
		<p><a href="https://unsplash.com/photos/green-coral-reef-under-water-vJGsAdVDaRw" target="_blank" class="text-black text-link">rafa koralowa</a></p>
	</div>

	<p>W obliczu współczesnych wyzwań, takich jak zmiany klimatyczne, nadmierny połów ryb czy zanieczyszczenie plastikiem, Pacyfik staje się kluczowym punktem skupienia dla globalnych działań na rzecz ochrony. Zrozumienie i ochrona tej ogromnej przestrzeni morskiej są niezbędne dla utrzymania delikatnej równowagi ekosystemów planety i zapewnienia zrównoważonego współistnienia natury i ludzkości. Pacyfik, ze swoim majestatem i znaczeniem, pozostaje źródłem podziwu i inspiracji, uosabiając w sobie ogrom i tajemnice błękitnej przestrzeni naszej planety.</p>
</section>`;
}

export function enIndianPageContent([imgId1]: [number]) {
	return `<section>
	<h1>Indian Ocean</h1>
	<p>The Indian Ocean, Earth's third-largest ocean, spans the expanses between Africa, Asia, Australia, and the Indian subcontinent. Known for its warm temperatures and diverse marine ecosystems, it plays a crucial role in global climate regulation and maritime connectivity. This vast body of saltwater, with its strategic location, weaves together a narrative of environmental significance, historical trade routes, and vibrant biodiversity.</p>

	<p class="indent">Extending from the Arctic to the Antarctic, the Indian Ocean encompasses a range of climatic zones, fostering an intricate tapestry of marine life. From the tropical coral reefs of the Maldives to the rich fishing grounds along the coast of East Africa, the ocean supports a wealth of biodiversity. Its monsoon winds and seasonal currents influence regional weather patterns, impacting the livelihoods of coastal communities and shaping cultural practices.</p>

	<a href="https://science4fun.info/indian-ocean/" target="_blank" class="block my-4">
		<HumbakFile fid="${imgId1}"></HumbakFile>
	</a>

	<p>Historically, the Indian Ocean has served as a vital crossroads for trade and cultural exchange, connecting civilizations across Africa, the Middle East, South Asia, and Southeast Asia. The maritime Silk Road facilitated the flow of goods, ideas, and technologies, leaving a profound imprint on the development of societies along its shores. Islands like Madagascar, Seychelles, and Sri Lanka showcase the cultural diversity and resilience shaped by centuries of Indian Ocean interactions.</p>
</section>`;
}

export function plIndianPageContent([imgId1]: [number]) {
	return `<section>
	<h1>Ocean Indyjski</h1>
	<p>Ocean Indyjski, trzeci pod względem wielkości ocean na Ziemi, rozciąga się między kontynentami Afryki, Azji, Australii i subkontynentem Indyjskim. Znany ze swoich ciepłych temperatur i różnorodnych ekosystemów morskich, odgrywa kluczową rolę w globalnej regulacji klimatu i łączności morskiej. Ten ogromny obszar słonej wody, ze swoją strategiczną lokalizacją, tworzy narrację znaczenia środowiskowego, historycznych szlaków handlowych i bogatej bioróżnorodności.</p>

	<p class="indent">Rozciągający się od Arktyki po Antarktydę, Ocean Indyjski obejmuje różnorodne strefy klimatyczne, tworząc złożoną mozaikę życia morskiego. Od tropikalnych raf koralowych Malediwów po bogate w ryby wody wybrzeża Afryki Wschodniej, ocean wspiera bogactwo różnorodności biologicznej. Jego monsunowe wiatry i sezonowe prądy wpływają na regionalne wzorce pogodowe, wpływając na środowisko życia społeczności przybrzeżnych i kształtując praktyki kulturowe.</p>

	<a href="https://science4fun.info/indian-ocean/" target="_blank" class="block my-4">
		<HumbakFile fid="${imgId1}"></HumbakFile>
	</a>

	<p>Historycznie Ocean Indyjski pełnił rolę kluczowego skrzyżowania handlowego i wymiany kulturowej, łącząc cywilizacje Afryki, Bliskiego Wschodu, Południowej Azji i Azji Południowo-Wschodniej. Morski Szlak Jedwabny ułatwiał przepływ towarów, idei i technologii, pozostawiając głęboki ślad w rozwoju społeczeństw przy jego brzegach. Wyspy takie jak Madagaskar, Seszele i Sri Lanka ukazują różnorodność kulturową i odporność kształtowane przez wieki interakcji w regionie Oceanu Indyjskiego.</p>
</section>`;
}

export function enMediterraneanPageContent([imgId1, imgId2]: [number, number]) {
	return `<section>
	<h1>Mediterranean sea</h1>
	<p>The Mediterranean Sea, nestled between the continents of Europe, Africa, and Asia, is a captivating and historically rich body of water. Often referred to as the "cradle of civilization," the Mediterranean has played a central role in shaping the cultural and economic development of the surrounding regions. Its unique geography, characterized by diverse coastlines and islands, has fostered a mosaic of cultures, making it a melting pot of civilizations throughout history.</p>

	<p class="indent">This sea, bordered by countries like Italy, Greece, Turkey, Egypt, and Spain, boasts a moderate climate and supports an abundance of marine life. From the azure waters of the Aegean to the vibrant coral reefs near Egypt, the Mediterranean hosts a remarkable array of biodiversity. Its strategic location has made it a crossroads for trade, exploration, and cultural exchange, with ancient seafaring civilizations leaving their indelible mark on its shores.</p>

	<a href="https://www.drishtiias.com/daily-updates/daily-news-analysis/mediterranean-sea" target="_blank" class="block my-4">
		<HumbakFile fid="${imgId1}"></HumbakFile>
	</a>

	<p>The Mediterranean Sea is not only a cradle of ancient civilizations but also a living testament to the delicate balance between nature and human activities. Today, it faces modern challenges such as pollution, overfishing, and climate change. Efforts to protect and preserve the Mediterranean's ecological integrity are crucial to ensuring the continued well-being of its marine ecosystems and the sustainable coexistence of the communities that call its shores home. The Mediterranean, with its azure waters and storied past, remains a symbol of the enduring connection between humanity and the sea.</p>

	<div class="described-image">
		<HumbakFile fid="${imgId2}"></HumbakFile>
		<p><a href="https://unsplash.com/photos/aerial-view-of-city-near-body-of-water-during-daytime-S_3PsmDwU5c" target="_blank" class="text-black text-link">Greece</a></p>
	</div>
</section>`;
}

export function plMediterraneanPageContent([imgId1, imgId2]: [number, number]) {
	return `<section>
	<h1>Morze Śródziemnomorskie</h1>
	<p>Morze Śródziemne, położone między kontynentami Europy, Afryki i Azji, to fascynujące i historycznie bogate akwen słony. Często nazywane "żłobem cywilizacji", Morze Śródziemne odegrało centralną rolę w kształtowaniu rozwoju kulturalnego i ekonomicznego otaczających regionów. Jego unikalna geografia, charakteryzowana zróżnicowanymi liniami brzegowymi i wyspami, sprzyjała mozaice kultur, tworząc z niego miejsce wielokulturowe przez wieki.</p>

	<p class="indent">To morze, otoczone przez kraje takie jak Włochy, Grecja, Turcja, Egipt i Hiszpania, cieszy się umiarkowanym klimatem i wspiera obfitość życia morskiego. Od lazurowych wód Morza Egejskiego po kolorowe rafy koralowe koło Egiptu, Morze Śródziemne gości niezwykłą różnorodność biologiczną. Jego strategiczna lokalizacja uczyniła je skrzyżowaniem szlaków handlowych, miejscem eksploracji i wymiany kulturowej, z antycznymi cywilizacjami pozostawiającymi niezatarte ślady na jego brzegach.</p>

	<a href="https://www.drishtiias.com/daily-updates/daily-news-analysis/mediterranean-sea" target="_blank" class="block my-4">
		<HumbakFile fid="${imgId1}"></HumbakFile>
	</a>

	<p>Morze Śródziemne to nie tylko kolebka starożytnych cywilizacji, ale także żywy dowód na delikatną równowagę między naturą a działalnością człowieka. Dzisiaj stoi ono przed nowoczesnymi wyzwaniami, takimi jak zanieczyszczenie, nadmierny połów ryb czy zmiany klimatu. Dążenia do ochrony i zachowania ekologicznej integralności Morza Śródziemnego są kluczowe dla zapewnienia dalszego dobrostanu jego ekosystemów morskich i zrównoważonego współistnienia społeczności, które nazywają jego brzegi domem. Morze Śródziemne, ze swoimi lazurowymi wodami i bogatą historią, pozostaje symbolem trwałego związku między ludzkością a morzem.</p>

	<div class="described-image">
		<HumbakFile fid="${imgId2}"></HumbakFile>
		<p><a href="https://unsplash.com/photos/aerial-view-of-city-near-body-of-water-during-daytime-S_3PsmDwU5c" target="_blank" class="text-black text-link">Grecja</a></p>
	</div>
</section>`;
}

export function enBalticPageContent([imgId1, imgId2]: [number, number]) {
	return `<section>
	<h1>Baltic Sea</h1>
	<p>The Baltic Sea, nestled within the northeastern region of Europe, is a unique and brackish body of water surrounded by nine countries: Denmark, Estonia, Finland, Germany, Latvia, Lithuania, Poland, Russia, and Sweden. This relatively shallow and enclosed sea has played a significant role in the history, culture, and economy of the Baltic region. Known for its distinctive blend of fresh and saltwater, the Baltic Sea presents a delicate and interconnected ecosystem.</p>

	<div class="split-container-2">
		<div class="described-image">
			<HumbakFile fid="${imgId1}"></HumbakFile>
			<p><a href="https://pl.m.wikipedia.org/wiki/Plik:Baltic_Sea_map.png" target="_blank" class="text-black text-link">map</a></p>
		</div>
		<div class="described-image">
			<HumbakFile fid="${imgId2}"></HumbakFile>
			<p><a href="https://unsplash.com/photos/brown-wooden-fence-on-beach-during-daytime-cRzcTyM70Q0" target="_blank" class="text-black text-link">Baltic Sea beach</a></p>
		</div>
	</div>

	<p>The Baltic Sea is characterized by its numerous islands, coastal landscapes, and diverse marine habitats. From the archipelagos of Sweden to the sandy shores of the Baltic countries, this sea hosts a variety of flora and fauna adapted to its specific conditions. Despite its relatively small size compared to other seas, the Baltic Sea has been a crucial waterway for trade, connecting the countries along its shores and facilitating cultural exchange.</p>

	<p class="indent">Morze Śródziemne to nie tylko kolebka starożytnych cywilizacji, ale także żywy dowód na delikatną równowagę między naturą a działalnością człowieka. Dzisiaj stoi ono przed nowoczesnymi wyzwaniami, takimi jak zanieczyszczenie, nadmierny połów ryb czy zmiany klimatu. Dążenia do ochrony i zachowania ekologicznej integralności Morza Śródziemnego są kluczowe dla zapewnienia dalszego dobrostanu jego ekosystemów morskich i zrównoważonego współistnienia społeczności, które nazywają jego brzegi domem. Morze Śródziemne, ze swoimi lazurowymi wodami i bogatą historią, pozostaje symbolem trwałego związku między ludzkością a morzem.</p>
</section>`;
}

export function plBalticPageContent([imgId1, imgId2]: [number, number]) {
	return `<section>
	<h1>Morze Bałtyckie</h1>
	<p>Morze Bałtyckie, usytuowane w północno-wschodniej części Europy, to unikalne i słonawo-słodkowodne akwen otoczone dziewięcioma krajami: Danią, Estonią, Finlandią, Niemcami, Łotwą, Litwą, Polską, Rosją i Szwecją. To stosunkowo płytkie i zamknięte morze odegrało istotną rolę w historii, kulturze i gospodarce regionu bałtyckiego. Znane ze swojego charakterystycznego połączenia słodkiej i słonej wody, Morze Bałtyckie prezentuje delikatny i wzajemnie powiązany ekosystem.</p>

	<div class="split-container-2">
		<div class="described-image">
			<HumbakFile fid="${imgId1}"></HumbakFile>
			<p><a href="https://pl.m.wikipedia.org/wiki/Plik:Baltic_Sea_map.png" target="_blank" class="text-black text-link">położenie</a></p>
		</div>
		<div class="described-image">
			<HumbakFile fid="${imgId2}"></HumbakFile>
			<p><a href="https://unsplash.com/photos/brown-wooden-fence-on-beach-during-daytime-cRzcTyM70Q0" target="_blank" class="text-black text-link">plaża nad Morzem Bałtyckim</a></p>
		</div>
	</div>

	<p>Morze Bałtyckie wyróżnia się licznymi wyspami, krajobrazami przybrzeżnymi i różnorodnymi siedliskami morskim. Od archipelagów Szwecji po piaszczyste wybrzeża krajów bałtyckich, to morze gości różnorodną florę i faunę dostosowaną do swoich specyficznych warunków. Pomimo swojego stosunkowo niewielkiego rozmiaru w porównaniu z innymi morzami, Morze Bałtyckie odgrywało kluczową rolę jako szlak handlowy, łącząc kraje leżące wzdłuż jego brzegów i umożliwiając wymianę kulturową.</p>

	<p class="indent">Stan środowiska Morza Bałtyckiego napotykał wyzwania, zwłaszcza w ostatnich dziesięcioleciach, takie jak eutrofizacja, zanieczyszczenie i zmiany w bioróżnorodności. Działania mające na celu rozwiązanie tych problemów obejmują współpracę między krajami bałtyckimi a Unią Europejską w celu wprowadzenia zrównoważonych praktyk i działań konserwacyjnych. Morze Bałtyckie, ze swoimi złożonymi krajobrazami przybrzeżnymi i wspólną historią, stanowi przypomnienie o znaczeniu ochrony naszych mórz dla przyszłych pokoleń, podkreślając konieczność odpowiedzialnego zarządzania w celu utrzymania delikatnej równowagi tego wyjątkowego środowiska morskiego.</p>
</section>`;
}

export function enBlackPageContent([imgId1, imgId2, imgId3]: [number, number, number]) {
	return `<section>
	<h1>Black Sea</h1>
	<p>The Black Sea, nestled between Southeastern Europe and Western Asia, is a captivating and historically significant body of water. Surrounded by six countries - Bulgaria, Romania, Ukraine, Russia, Turkey, and Georgia - the Black Sea has been a crossroads for trade, cultural exchange, and geopolitical dynamics throughout the ages. Known for its unique hydrography, the Black Sea combines elements of both freshwater and saltwater, creating a distinctive environment that has influenced the development of civilizations along its shores.</p>

	<p class="indent">Characterized by diverse coastlines, the Black Sea boasts ancient cities, vibrant ecosystems, and a rich maritime history. From the ancient Greek colonies along the western coast to the bustling ports of modern-day Turkey, the Black Sea has been a hub for commerce and cultural interaction. Its strategic importance has been highlighted by the historical Silk Road and the more recent geopolitical considerations, emphasizing its role in regional stability.</p>

	<p class="indent">The environmental health of the Black Sea has faced challenges, including issues such as pollution, overfishing, and changes in biodiversity. International efforts, involving collaboration among the countries bordering the Black Sea, aim to address these challenges and promote sustainable practices for the benefit of both the marine ecosystems and the communities that depend on them. The Black Sea, with its complex history and ecological diversity, stands as a testament to the intricate connections between human activities and the natural world, urging responsible stewardship for its continued well-being.</p>

	<div class="split-container-2">
		<div class="described-image">
			<HumbakFile fid="${imgId1}"></HumbakFile>
			<p><a href="https://unsplash.com/photos/blue-sky-over-sea-during-daytime-NH0u5ate6vY" target="_blank" class="text-black text-link">crimea peninsula</a></p>
		</div>
		<div class="described-image">
			<HumbakFile fid="${imgId2}"></HumbakFile>
			<p><a href="https://unsplash.com/photos/brown-rocky-shore-with-blue-sea-water-during-daytime-OQddDk-3Xgs" target="_blank" class="text-black text-link">rocks in the sea on a coast</a></p>
		</div>
	</div>

	<a href="https://en.wikipedia.org/wiki/Black_Sea#/media/File:Black_Sea_map.png" target="_blank" class="block my-4">
		<HumbakFile fid="${imgId3}"></HumbakFile>
	</a>
</section>`;
}

export function plBlackPageContent([imgId1, imgId2, imgId3]: [number, number, number]) {
	return `<section>
	<h1>Morze Czarne</h1>
	<p>Morze Czarne, położone między Europą Południowo-Wschodnią a Zachodnią Azją, to fascynujące i historycznie istotne akwen słony. Otoczone przez sześć krajów - Bułgarię, Rumunię, Ukrainę, Rosję, Turcję i Gruzję - Morze Czarne było skrzyżowaniem szlaków handlowych, wymiany kulturowej i dynamicznych relacji geopolitycznych na przestrzeni wieków. Znane ze swojej unikalnej hydrografii, Morze Czarne łączy elementy wód słodkich i słonych, tworząc charakterystyczne środowisko, które wpłynęło na rozwój cywilizacji na jego brzegach.</p>

	<p class="indent">Charakteryzujące się zróżnicowanymi liniami brzegowymi, Morze Czarne posiada starożytne miasta, bogate ekosystemy i burzliwą historię morską. Od starożytnych kolonii greckich na zachodnim wybrzeżu po ruchliwe porty współczesnej Turcji, Morze Czarne stanowiło centrum handlu i interakcji kulturowej. Jego strategiczne znaczenie podkreślają zarówno historyczna Jedwabna Droga, jak i bardziej współczesne rozważania geopolityczne, akcentujące jego rolę w regionalnej stabilności.</p>

	<p class="indent">Środowiskowe zdrowie Morza Czarnego napotykało wyzwania, w tym problemy związane z zanieczyszczeniem, nadmiernym połowem ryb czy zmianami w bioróżnorodności. Międzynarodowe wysiłki, obejmujące współpracę krajów otaczających Morze Czarne, mają na celu rozwiązanie tych problemów i promowanie zrównoważonych praktyk na rzecz korzyści zarówno ekosystemów morskich, jak i społeczności zależnych od nich. Morze Czarne, ze swoją skomplikowaną historią i różnorodnością ekologiczną, stanowi dowód na złożone powiązania między działalnością ludzką a światem przyrody, wzywając do odpowiedzialnej opieki w celu zapewnienia jego dalszego dobrostanu.</p>

	<div class="split-container-2">
		<div class="described-image">
			<HumbakFile fid="${imgId1}"></HumbakFile>
			<p><a href="https://unsplash.com/photos/blue-sky-over-sea-during-daytime-NH0u5ate6vY" target="_blank" class="text-black text-link">półwysep krymski</a></p>
		</div>
		<div class="described-image">
			<HumbakFile fid="${imgId2}"></HumbakFile>
			<p><a href="https://unsplash.com/photos/brown-rocky-shore-with-blue-sea-water-during-daytime-OQddDk-3Xgs" target="_blank" class="text-black text-link">skały w wodzie nad wybrzeżem</a></p>
		</div>
	</div>

	<a href="https://en.wikipedia.org/wiki/Black_Sea#/media/File:Black_Sea_map.png" target="_blank" class="block my-4">
		<HumbakFile fid="${imgId3}"></HumbakFile>
	</a>
</section>`;
}

export function enGreatLakesPageContent([imgId1, imgId2, imgId3]: [number, number, number]) {
	return `<section>
	<h1>The Great Lakes</h1>

	<p>The Great Lakes, a majestic and interconnected system of freshwater lakes located in North America, stand as a natural wonder of monumental proportions. Comprising Lake Superior, Lake Michigan, Lake Huron, Lake Erie, and Lake Ontario, these vast bodies of water hold about 84% of North America's freshwater and play a vital role in the region's ecology, economy, and cultural heritage. Enveloped by the United States and Canada, the Great Lakes have been a source of inspiration, sustenance, and exploration throughout history.</p>

	<table>
		<thead>
			<tr>
				<th>Great Lake</th>
				<th>Total Area (sq km)</th>
				<th>Maximum Depth (m)</th>
				<th>Average Depth (m)</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td>Superior</td>
				<td>82,100</td>
				<td>406</td>
				<td>147</td>
			</tr>
			<tr>
				<td>Michigan</td>
				<td>58,000</td>
				<td>281</td>
				<td>85</td>
			</tr>
			<tr>
				<td>Huron</td>
				<td>59,600</td>
				<td>229</td>
				<td>59</td>
			</tr>
			<tr>
				<td>Erie</td>
				<td>25,700</td>
				<td>64</td>
				<td>19</td>
			</tr>
			<tr>
				<td>Ontario</td>
				<td>19,000</td>
				<td>244</td>
				<td>86</td>
			</tr>
		</tbody>
	</table>

	<p>The Great Lakes, with their expansive shores and diverse landscapes, offer a mosaic of habitats for a wide array of plant and animal species. From the rugged terrain surrounding Lake Superior to the fertile plains near Lake Ontario, the region supports a rich biodiversity, including iconic species like the lake sturgeon, bald eagle, and various species of trout and salmon. The lakes also serve as a critical migratory pathway for numerous bird species, emphasizing their significance in the broader North American ecosystem.</p>

	<div class="split-container-2">
		<div class="described-image">
			<HumbakFile fid="${imgId1}"></HumbakFile>
			<p><a href="https://unsplash.com/photos/aerial-photograph-of-seaside-with-forest-DusR7CnbCNU" target="_blank" class="text-black text-link">Lake Michigan</a></p>
		</div>
		<div class="described-image">
			<HumbakFile fid="${imgId2}"></HumbakFile>
			<p><a href="https://unsplash.com/photos/a-body-of-water-sitting-next-to-a-lush-green-forest-Cf6xshF2EYQ" target="_blank" class="text-black text-link">Lake Huron</a></p>
		</div>
	</div>

	<p>Historically, the Great Lakes have been central to the lives of indigenous peoples, serving as transportation routes, sources of sustenance, and focal points of cultural significance. European explorers and settlers later utilized the lakes for trade and industry, leading to the growth of cities and the development of shipping routes connecting the Atlantic Ocean to the heart of North America. Today, the Great Lakes continue to be vital for shipping, recreation, and supporting diverse ecosystems.</p>

	<p class="indent">Despite their grandeur, the Great Lakes face environmental challenges, including issues like pollution, invasive species, and habitat degradation. Collaborative efforts between the United States and Canada, as well as local initiatives, aim to address these challenges and preserve the integrity of the Great Lakes. The lakes, with their immense beauty and ecological importance, stand as a testament to the delicate balance between human activities and the preservation of our planet's natural treasures.</p>

	<a href="https://en.m.wikipedia.org/wiki/File:Great-Lakes.svg" target="_blank" class="block my-4">
		<HumbakFile fid="${imgId3}"></HumbakFile>
	</a>
</section>`;
}

export function plGreatLakesPageContent([imgId1, imgId2, imgId3]: [number, number, number]) {
	return `<section>
	<h1>Wielkie Jeziora</h1>

	<p>Wielkie Jeziora, majestatyczny i powiązany system jezior słodkowodnych położony w Ameryce Północnej, stanowią naturalne cuda monumentalnych rozmiarów. Obejmujące Jezioro Górne, Jezioro Michigan, Jezioro Huron, Jezioro Erie i Jezioro Ontario, te rozległe zbiorniki wodne zawierają około 84% słodkiej wody w Ameryce Północnej i odgrywają kluczową rolę w ekologii, gospodarce i dziedzictwie kulturowym regionu. Obejmujące obszar Stanów Zjednoczonych i Kanady, Wielkie Jeziora były źródłem inspiracji, utrzymania i eksploracji na przestrzeni dziejów.</p>

	<table>
		<thead>
			<tr>
				<th>Wielkie Jezioro</th>
				<th>Powierzchnia Całkowita (km<sup>2</sup>)</th>
				<th>Maksymalna Głębokość (m)</th>
				<th>Średnia Głębokość (m)</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td>Superior</td>
				<td>82,100</td>
				<td>406</td>
				<td>147</td>
			</tr>
			<tr>
				<td>Michigan</td>
				<td>58,000</td>
				<td>281</td>
				<td>85</td>
			</tr>
			<tr>
				<td>Huron</td>
				<td>59,600</td>
				<td>229</td>
				<td>59</td>
			</tr>
			<tr>
				<td>Erie</td>
				<td>25,700</td>
				<td>64</td>
				<td>19</td>
			</tr>
			<tr>
				<td>Ontario</td>
				<td>19,000</td>
				<td>244</td>
				<td>86</td>
			</tr>
		</tbody>
	</table>

	<p>Wielkie Jeziora, ze swoimi rozległymi brzegami i zróżnicowanymi krajobrazami, oferują mozaikę siedlisk dla wielu gatunków roślin i zwierząt. Od dzikich terenów wokół Jeziora Górnego po żyzne równiny w okolicach Jeziora Ontario, region ten wspiera bogactwo różnorodności biologicznej, obejmując ikoniczne gatunki, takie jak jesiotr jeziorowy, bielik amerykański oraz różne gatunki troci i łososia. Jeziora pełnią również kluczową rolę jako ścieżka migracyjna dla licznych gatunków ptaków, podkreślając ich znaczenie w szerszym ekosystemie Ameryki Północnej.</p>

	<div class="split-container-2">
		<div class="described-image">
			<HumbakFile fid="${imgId1}"></HumbakFile>
			<p><a href="https://unsplash.com/photos/aerial-photograph-of-seaside-with-forest-DusR7CnbCNU" target="_blank" class="text-black text-link">Jezioro Michigan</a></p>
		</div>
		<div class="described-image">
			<HumbakFile fid="${imgId2}"></HumbakFile>
			<p><a href="https://unsplash.com/photos/a-body-of-water-sitting-next-to-a-lush-green-forest-Cf6xshF2EYQ" target="_blank" class="text-black text-link">Jezioro Huron</a></p>
		</div>
	</div>

	<p>Historycznie Wielkie Jeziora były centralne dla życia rdzennych ludów, pełniąc rolę dróg wodnych, źródeł utrzymania i punktów odniesienia kulturowego. Europejscy odkrywcy i osadnicy później wykorzystywali jeziora do handlu i przemysłu, co doprowadziło do rozwoju miast i utworzenia szlaków żeglugowych łączących Ocean Atlantycki z sercem Ameryki Północnej. Dziś Wielkie Jeziora pozostają kluczowe dla żeglugi, rekreacji i wsparcia różnorodnych ekosystemów.</p>

	<p class="indent">Mimo swojej okazałości, Wielkie Jeziora stają w obliczu wyzwań środowiskowych, takich jak zanieczyszczenie, inwazyjne gatunki i degradacja siedlisk. Wspólne działania między Stanami Zjednoczonymi a Kanadą, a także inicjatywy lokalne, mają na celu radzenie sobie z tymi problemami i zachowanie integralności Wielkich Jezior. Jeziora, ze swoim ogromnym pięknem i ekologicznym znaczeniem, stanowią dowód delikatnej równowagi między działalnością człowieka a zachowaniem naturalnych skarbów naszej planety.</p>

	<a href="https://en.m.wikipedia.org/wiki/File:Great-Lakes.svg" target="_blank" class="block my-4">
		<HumbakFile fid="${imgId3}"></HumbakFile>
	</a>
</section>`;
}

export function enBaikalLakesPageContent([imgId1, imgId2]: [number, number]) {
	return `<section>
	<h1>Baikal Lake</h1>
	<p>Lake Baikal, a jewel of Siberia and the deepest freshwater lake on Earth, commands awe with its breathtaking beauty and unparalleled ecological significance. Nestled in the heart of Russia, this ancient lake predates even the mountains that cradle its shores. Its vastness, purity, and mystique have earned it the title of the "Galapagos of Russia," showcasing a unique evolutionary story found nowhere else on the planet.</p>

	<p class="indent">Spanning over 25 million years in age, Lake Baikal holds a staggering 20% of the world's unfrozen freshwater reserve. The lake's clarity is unparalleled, allowing visibility to depths of over 40 meters. Baikal is home to an array of endemic species, including the mesmerizing Baikal seal, found nowhere else on Earth. The surrounding landscapes, from the jagged peaks of the Sayan Mountains to the dense Siberian taiga, contribute to the lake's unrivaled natural splendor.</p>

	<a href="https://kids.britannica.com/kids/article/Lake-Baikal/602893" target="_blank" class="block my-4">
		<HumbakFile fid="${imgId1}"></HumbakFile>
	</a>

	<p>In winter, Lake Baikal transforms into a crystalline wonderland, as its surface freezes and creates surreal ice formations. This annual phenomenon draws adventurers and photographers from around the globe to witness the ethereal beauty of Baikal's ice. Beyond its scenic allure, Baikal plays a crucial role in scientific research, offering insights into the Earth's geological processes and serving as a living laboratory for the study of evolution.</p>

	<a href="https://unsplash.com/photos/body-of-water-near-mountain-view-r6FU8zqrgdM" target="_blank" class="block my-4">
		<HumbakFile fid="${imgId2}"></HumbakFile>
	</a>

	<p>However, Lake Baikal faces modern challenges, including pollution and climate change, threatening its delicate ecosystem. Conservation efforts strive to balance the region's development with the preservation of this natural wonder. Lake Baikal, with its mystical depths and ecological importance, stands as a testament to the delicate dance between humanity and the pristine environments that shape our planet.</p>
</section>`;
}

export function plBaikalLakesPageContent([imgId1, imgId2]: [number, number]) {
	return `<section>
	<h1>Jezioro Bajkał</h1>
	<p>Jezioro Bajkał, klejnot Syberii i najgłębsze słodkowodne jezioro na Ziemi, budzi podziw swoim zapierającym dech w piersiach pięknem i niezrównanym znaczeniem ekologicznym. Usytuowane w sercu Rosji, to starożytne jezioro istnieje nawet od czasów gór, które otaczają jego brzegi. Jego ogrom, czystość i mistyka przyniosły mu miano "Galapagos Rosji", prezentując unikalną historię ewolucji, którą nie znajdziemy nigdzie indziej na świecie.</p>

	<p class="indent">Osiągając wiek ponad 25 milionów lat, Jezioro Bajkał przechowuje zdumiewające 20% zasobów niespłynnej słodkiej wody na świecie. Jego klarowność jest niezrównana, umożliwiając widoczność na głębokość ponad 40 metrów. Bajkał jest domem dla licznych gatunków endemitów, w tym fascynującej foki bajkalskiej, której nie spotkamy nigdzie indziej na Ziemi. Otaczające je krajobrazy, od stromych szczytów Gór Sajańskich po gęste syberyjskie tajgi, przyczyniają się do niezrównanej przyrodniczej piękności jeziora.</p>

	<a href="https://kids.britannica.com/kids/article/Lake-Baikal/602893" target="_blank" class="block my-4">
		<HumbakFile fid="${imgId1}"></HumbakFile>
	</a>

	<p>Zimą Jezioro Bajkał przemienia się w krystaliczne królestwo, gdy jego powierzchnia zamarza, tworząc surrealistyczne formacje lodowe. To coroczne zjawisko przyciąga podróżników i fotografów z całego świata, by być świadkami eterycznej piękności lodu Bajkału. Poza swoim urokiem krajobrazowym, Bajkał odgrywa kluczową rolę w badaniach naukowych, oferując wgląd w geologiczne procesy Ziemi i pełniąc funkcję żywej laboratorium do badania ewolucji.</p>

	<a href="https://unsplash.com/photos/body-of-water-near-mountain-view-r6FU8zqrgdM" target="_blank" class="block my-4">
		<HumbakFile fid="${imgId2}"></HumbakFile>
	</a>

	<p>Jednak Jezioro Bajkał stawia czoło współczesnym wyzwaniom, w tym zanieczyszczeniu i zmianom klimatycznym, zagrażając delikatnemu ekosystemowi. Działania na rzecz ochrony dążą do znalezienia równowagi między rozwojem regionu a zachowaniem tego naturalnego cudu. Jezioro Bajkał, ze swoimi mistycznymi głębokościami i znaczeniem ekologicznym, stanowi dowód na delikatny taniec między ludzkością a dziewiczymi środowiskami, które kształtują naszą planetę.</p>
</section>`;
}

export function enCaspianLakesPageContent([imgId1, imgId2]: [number, number]) {
	return `<section>
	<h1>Caspian Sea</h1>
	<p>The Caspian Sea, the world's largest inland body of water, stretches across the vast landscapes of Eastern Europe and Western Asia. Bordered by five countries – Russia, Kazakhstan, Turkmenistan, Iran, and Azerbaijan – the Caspian Sea is a mosaic of cultural, historical, and ecological significance. This immense saltwater lake, often referred to as a sea due to its size, unfolds a narrative of diverse landscapes and geopolitical intricacies.</p>

	<a href="https://www.researchgate.net/figure/Map-of-the-Caspian-Sea-and-surrounding-countries-modified-from-an-original-map-provided_fig1_313864880" target="_blank" class="block my-4">
		<HumbakFile fid="${imgId1}"></HumbakFile>
	</a>

	<p>Encompassing an area larger than many countries, the Caspian Sea is a unique ecosystem with an intricate balance of marine life. Its diverse shores range from the desolate expanses of the Karakum Desert to the lush coastal regions teeming with biodiversity. The sea hosts a variety of species, including the sturgeon, a fish prized for its caviar. The ancient city of Baku along its shores and the historical Silk Road routes that skirted its edges are testaments to the Caspian's role as a crossroads of civilizations.</p>

	<div class="described-image">
		<HumbakFile fid="${imgId2}"></HumbakFile>
		<p><a href="https://unsplash.com/photos/aerial-photograph-of-islands-WKT3TE5AQu0" target="_blank" class="text-black text-link">Tyuleniy archipelago</a></p>
	</div>

	<p>While the Caspian Sea has long been a source of prosperity, providing livelihoods through fishing and facilitating trade, it faces contemporary challenges such as environmental degradation and concerns over resource management. The complex legal status of the sea, compounded by the interests of the surrounding nations, adds another layer to its dynamic story. As efforts are made to address environmental concerns and promote sustainable practices, the Caspian Sea remains a symbol of the delicate interplay between nature, history, and the geopolitics of the region.</p>
</section>`
}

export function plCaspianLakesPageContent([imgId1, imgId2]: [number, number]) {
	return `<section>
	<h1>Morze Kaspijskie</h1>
	<p>Morze Kaspijskie, największe śródlądowe akwen na świecie, rozciąga się po rozległych krajobrazach Wschodniej Europy i Zachodniej Azji. Graniczące z pięcioma krajami - Rosją, Kazachstanem, Turkmenistanem, Iranem i Azerbejdżanem - Morze Kaspijskie to mozaika znaczenia kulturowego, historycznego i ekologicznego. To ogromne słone jezioro, często nazywane morzem ze względu na swoje rozmiary, rozpływa się w opowieść o zróżnicowanych krajobrazach i skomplikowanych relacjach geopolitycznych.</p>

	<a href="https://www.researchgate.net/figure/Map-of-the-Caspian-Sea-and-surrounding-countries-modified-from-an-original-map-provided_fig1_313864880" target="_blank" class="block my-4">
		<HumbakFile fid="${imgId1}"></HumbakFile>
	</a>

	<p>Obejmując obszar większy niż wiele krajów, Morze Kaspijskie stanowi unikalny ekosystem z delikatnym równowagą życia morskiego. Jego zróżnicowane brzegi rozciągają się od opustoszałych obszarów Pustyni Karakum po bujne nadbrzeżne regiony pełne różnorodności biologicznej. Morze gości różnorodne gatunki, w tym jesiotra, rybę cenioną za kawior. Starożytna miejscowość Baku na jego brzegach i historyczne szlaki Jedwabnego Szlaku, które omijały jego obrzeża, to świadectwa roli Morza Kaspijskiego jako skrzyżowania cywilizacji.</p>

	<div class="described-image">
		<HumbakFile fid="${imgId2}"></HumbakFile>
		<p><a href="https://unsplash.com/photos/aerial-photograph-of-islands-WKT3TE5AQu0" target="_blank">Archipelag Tyuleniy</a></p>
	</div>

	<p>Choć Morze Kaspijskie od dawna było źródłem dobrobytu, zapewniając środki utrzymania przez rybołówstwo i ułatwiając handel, stoi obecnie przed współczesnymi wyzwaniami, takimi jak degradacja środowiska i obawy dotyczące gospodarki zasobami. Skomplikowany status prawny morza, związany z interesami otaczających go narodów, dodaje kolejny element do jego dynamicznej historii. W miarę podejmowania działań mających na celu rozwiązanie problemów środowiskowych i promowanie zrównoważonych praktyk, Morze Kaspijskie pozostaje symbolem delikatnej współpracy między naturą, historią a geopolityką regionu.</p>
</section>`;
}
