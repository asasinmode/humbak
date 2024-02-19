import { env } from '../../env';

export const enHomePageContent = `<section>
	<h1>humbak demo</h1>
	<p>This is a demo page for <strong>humbak</strong>, a blog cms. Current content is a showcase of the features available and should be reset regularly. Most of the text content was generated with <a href="https://chat.openai.com/" target="_blank" class="text-link">ChatGPT</a> and images were taken from <a href="https://unsplash.com/" target="_blank" class="text-link">Unsplash</a>.</p>
</section>

<section>
	<h2>page</h2>
	<p>The content is displayed on the, well, <a href="#" class="text-link">page</a>. you are currently viewing.</p>

	<h2>api</h2>
	<p>The page and the admin communicate with and through the <a href="${env.API_URL}" target="_blank" class="text-link">api page</a>. Besides the <a href="${env.API_URL}" target="_blank" class="text-link">home page TODO fancy underline</a> (which I recommend you check out), there isn't much there.</p>

	<h2>admin</h2>
	<p>The content managment part of the <strong>humbak</strong> cms is done on the <a href="${env.ADMIN_URL}" target="_blank" class="text-link">admin page</a>. The following section describes the features available there and contains instructions on how to use them.</p>
</section>

<h2>features</h2>

<section>
	<h3>pages</h3>
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

export const plHomePageContent = `<section>
	<h1>humbak demo</h1>
	<p>To jest strona demo dla <strong>humbak</strong>, aplikacji CMS (content managment site - strona do zarządzania zawartością) dla bloga. Obecna zawartość przedstawia dostępną funkcjonalność CMS'a i powinna być resetowana regularnie. Większość tekstu została wygenerowana przez <a href="https://chat.openai.com/" target="_blank">ChatGPT</a>.</p>
</section>

<section>
	<h2>funkcjonalność</h2>

	<h3>strona</h3>
	<p>Zawartość zarządzana przez CMS jest wyświetlana na... <a href="#" class="text-link">stronie</a>. Tej samej, którą obecnie przeglądasz.</p>

	<h3>api</h3>
	<p>Strona główna i strona admina komunikują się przez i za pomocą <a href="${env.API_URL}" target="_blank" class="text-link">strony api</a>. Poza <a href="${env.API_URL}" target="_blank" class="text-link">stroną domową TODO fancy underline</a> (którą polecam odwiedzić), nie ma na niej za wiele.</p>

	<h3>admin</h3>
	<p>Zarządzanie zawartością <strong>humbak</strong> cms'a odbywa się na <a href="${env.ADMIN_URL}" target="_blank" class="text-link">stronie admina</a>. Następujące sekcje opisują funkcjonalność dostępną na niej oraz zawierają instrukcje, jak jej używać.</p>
</section>

<section>
	<h3>strony</h3>
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

	<a href="https://unsplash.com/photos/school-of-fish-in-body-of-water-9y7y26C-l4Y" target="_blank">
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

	<a href="https://unsplash.com/photos/school-of-fish-in-body-of-water-9y7y26C-l4Y" target="_blank">
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
			<li>Americas<li>
			<li>Europe<li>
			<li>Africa<li>
			<li>Antarctica<li>
		</ul>
	commands a position of profound significance in the global maritime landscape. As the second-largest ocean on Earth, the Atlantic encompasses a diverse range of climates, ecosystems, and marine life, contributing to its reputation as a dynamic and influential force in shaping the planet's interconnected systems.</p>

	<div class="described-image">
		<HumbakFile fid="${imgId1}"></HumbakFile>
		<p><a href="https://science4fun.info/atlantic-ocean/" target="_blank" class="text-black text-link">atlantic ocean map</a></p>
	</div>

	<p>The Atlantic Ocean serves as a conduit for complex oceanic currents and circulation patterns, influencing weather patterns and regulating the planet's climate. Its strategic location has historically facilitated exploration, trade, and cultural exchange among continents, forging connections that have shaped human history. The Atlantic, with its mighty currents and powerful storms, has witnessed centuries of seafaring adventures, playing a crucial role in maritime exploration and trade routes.</p>

	<a href="https://unsplash.com/photos/boat-on-sea-under-white-clouds-8eFbe3jQZ7Y" target="_blank">
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
			<li>Amerykami<li>
			<li>Europą<li>
			<li>Afryką<li>
			<li>Antarktydą<li>
		</ul>
	zajmuje pozycję o głębokim znaczeniu w globalnym krajobrazie morskim. Jako drugi co do wielkości ocean na Ziemi, Atlantyk obejmuje różnorodne klimaty, ekosystemy i życie morskie, przyczyniając się do swojej reputacji dynamicznej i wpływowej siły kształtującej złożone systemy naszej planety.</p>

	<div class="described-image">
		<HumbakFile fid="${imgId1}"></HumbakFile>
		<p><a href="https://science4fun.info/atlantic-ocean/" target="_blank" class="text-black text-link">mapa oceanu atlantyckiego</a></p>
	</div>

	<p>Ocean Atlantycki pełni funkcję kanału dla złożonych prądów oceanicznych i cyrkulacyjnych wzorców, wpływając na układy pogodowe i regulując klimat planety. Jego strategiczna lokalizacja historycznie ułatwiała eksplorację, handel i wymianę kulturową między kontynentami, kształtując powiązania, które wpłynęły na historię ludzkości. Atlantyk, z jego potężnymi prądami i gwałtownymi burzami, był świadkiem wieków morskich przygód, odgrywając istotną rolę w eksploracji morskiej i trasach handlowych.</p>

	<a href="https://unsplash.com/photos/boat-on-sea-under-white-clouds-8eFbe3jQZ7Y" target="_blank">
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

	<a href="https://science4fun.info/pacific-ocean/" target="_blank">
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

	<a href="https://science4fun.info/pacific-ocean/" target="_blank">
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

	<a href="https://science4fun.info/indian-ocean/" target="_blank">
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

	<a href="https://science4fun.info/indian-ocean/" target="_blank">
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

	<a href="https://www.drishtiias.com/daily-updates/daily-news-analysis/mediterranean-sea" target="_blank">
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

	<a href="https://www.drishtiias.com/daily-updates/daily-news-analysis/mediterranean-sea" target="_blank">
		<HumbakFile fid="${imgId1}"></HumbakFile>
	</a>

	<p>Morze Śródziemne to nie tylko kolebka starożytnych cywilizacji, ale także żywy dowód na delikatną równowagę między naturą a działalnością człowieka. Dzisiaj stoi ono przed nowoczesnymi wyzwaniami, takimi jak zanieczyszczenie, nadmierny połów ryb czy zmiany klimatu. Dążenia do ochrony i zachowania ekologicznej integralności Morza Śródziemnego są kluczowe dla zapewnienia dalszego dobrostanu jego ekosystemów morskich i zrównoważonego współistnienia społeczności, które nazywają jego brzegi domem. Morze Śródziemne, ze swoimi lazurowymi wodami i bogatą historią, pozostaje symbolem trwałego związku między ludzkością a morzem.</p>

	<div class="described-image">
		<HumbakFile fid="${imgId2}"></HumbakFile>
		<p><a href="https://unsplash.com/photos/aerial-view-of-city-near-body-of-water-during-daytime-S_3PsmDwU5c" target="_blank" class="text-black text-link">Grecja</a></p>
	</div>
</section>`;
}
