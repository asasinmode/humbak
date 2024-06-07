# humbak

This is a monorepo for **humbak** cms.

### dev

After cloning the repo, copy `.env.example` to `.env.[development|production]` and fill the variables

```bash
# install dependencies
pnpm i

pnpm -filter api dev
pnpm -filter admin dev
pnpm -filter page dev

# generate migrations
pnpm -filter api run db:generate
# drop migration
pnpm -filter api run db:drop-migration
# migrate
pnpm -filter api run db:migrate
# seed
pnpm -filter api run db:seed
# create user
pnpm -filter api run db:create-user username password
```

# pages

The **humbak** cms is made out of 3 pages: [api](https://github.com/asasinmode/humbak/tree/master/api), [admin](https://github.com/asasinmode/humbak/tree/master/admin) and the main [page](https://github.com/asasinmode/humbak/tree/master/page). The _admin_ page is used to manage the content displayed on the main _page_, both of which communicate with and through the _api_ page.

# features

## content

The cms' main feature is creating pages, which can be done on the admin home page. Once there, you can browse and search all the pages and edit their _content_, _css_ and _meta_.

### pages table

Located at the top are the home page are a search input and a table. The table contains all the created pages and can be filtered using the input above it. Each page has **edit** and **delete** buttons.

<img src="https://raw.githubusercontent.com/asasinmode/humbak/master/api/src/db/scripts/assets/pages-table-en.png" title="pages table" alt="pages table on admin page">

### page form

Below the table there is a form consisting of 4 text fields, the **editor** and the **preview box**. Between the _editor_ and the _preview box_ are **control buttons**. Going from top to bottom, the _control buttons_ are: **editor mode select**, **content formatting**, **snippets** and **Humbak Files**. The last, gray button in the middle can be used to resize the _editor_. Lastly, below the _editor_ there are the **clear** and **save** buttons.

<img src="https://raw.githubusercontent.com/asasinmode/humbak/master/api/src/db/scripts/assets/pages-form-en.png" title="content form" alt="content form on admin page">

Use the editor mode select to switch between editing page's _html_, _css_ and _meta_. Note that _meta_ should be a valid JSON array containing objects that will be mapped to meta tags, for example `{ "name": "description", "content": "My page's description" }` will create a tag `<meta name="description" content="My page's description">`.

### humbak files

The fourth _control button_, opens the **humbak files dialog**, inside of which you can browse and search all of your files and open their preview or copy their html tag.

<img src="https://raw.githubusercontent.com/asasinmode/humbak/master/api/src/db/scripts/assets/pages-humbak-files-en.png" title="humbak files dialog" alt="dialog with list of files">

_Humbak files_ can be uploaded on the files page and have some special features that are described in the humbak files section. To make their features work, inside the page html you use them through a special tag `<HumbakFile fid="1">`. They require a special **fid** attribute that contains the target _humbak file's_ id and accept all valid html attributes, such as _class_ or _style_.

## menu

After creating pages you can manage the menu layout on the admin menu page.

At the top there are: the expandable and movable **hidden pages list**, the **language select** and the **save button**. Below, there is the **menu layout editor** that is an interactive preview of the menu and can be used to hide and move the links around.

<img src="https://raw.githubusercontent.com/asasinmode/humbak/master/api/src/db/scripts/assets/menu-en.png" title="menu page" alt="menu page with interactive preview for editing the layout">

### example of using the menu layout editor

<img src="https://raw.githubusercontent.com/asasinmode/humbak/master/api/src/db/scripts/assets/menu-en.gif" title="menu page using" alt="menu page moving items using the interactive preview">

## files

**Humbak files** can be uploaded and managed on the admin files page.

In the top left corner you can find the **directory breadcrumbs** that show the current directory, the path to it and can be used to navigate directory structure. To the right of it, there are 2 buttons used to toggle between **list** and **tile** view, along with the **save button**.

<img src="https://raw.githubusercontent.com/asasinmode/humbak/master/api/src/db/scripts/assets/files-moving.png" title="moving files" alt="moving files and directories">

Below these are all of your files with the exception of the first item that's used to create new directories and upload new files. Besides editing files and directories' attributes you can navigate to directories or delete/move files and directories. The **move** button can either be dragged to the target directory or be clicked on to open the **move dialog**.

<img src="https://raw.githubusercontent.com/asasinmode/humbak/master/api/src/db/scripts/assets/files-toggling-view-en.gif" title="toggling view" alt="toggling files view between list and tiles">

### move dialog

The move dialog contains a list of directories. In case the directory you want to move a file/dir to is not in the same location you are currently in, you can use it to select a target dir and move a file there.

<img src="https://raw.githubusercontent.com/asasinmode/humbak/master/api/src/db/scripts/assets/files-move-dialog-en.png" title="move dialog" alt="dialog with list of dirs to choose from">

## global

While on the admin home page you can edit _css_ and _meta_ specific to each page, the admin global page is used to manage _css_ and _meta_ shared between all pages (with _meta_ being language-specific).

At the top you can select the editor's mode, choosing between css and meta, along with, in case of being in meta edit mode, choosing the target language. To the right of these selects are the content formatting and the save buttons. Below them is the editor.

<img src="https://raw.githubusercontent.com/asasinmode/humbak/master/api/src/db/scripts/assets/global-en.png" title="global page" alt="css editor on page global">

## slider

The **slider** seen at the top of all of your pages can be configured on the admin slider page.

The first row on the page contains the **language select**, the **slide select**, in order, **humbak files**, **slider settings** and **content formatting** _control buttons_ and the clear and save buttons. Below these is the _editor_, under which is a form for managing the current slide's attributes: _name_, _language_ and _visibility_.

<img src="https://raw.githubusercontent.com/asasinmode/humbak/master/api/src/db/scripts/assets/slider-form-en.png" title="slide form" alt="slide form with html editor and slide attributes inputs">

Under the form are the **preview box**, showing the preview of currently edited slide, and a copy of the **slider** seen on the page. Note that while the _preview box_ updates in real time with current slide's _html_, the _slider_ updates only after saving current changes.

<img src="https://raw.githubusercontent.com/asasinmode/humbak/master/api/src/db/scripts/assets/slider-previews-en.png" title="slider previews" alt="single slide and whole slider previews">

### slider settings

The _slider settings_ control button opens the **slider configuration dialog**. Inside it, you can adjust the slider's **aspect ratio**. Note that it should be in a format that's supported by the [css calc function](https://developer.mozilla.org/en-US/docs/Web/CSS/calc).

<img src="https://raw.githubusercontent.com/asasinmode/humbak/master/api/src/db/scripts/assets/slider-settings-dialog-en.png" title="slider settings dialog" alt="slider settings dialog with aspect ratio input">

## footer

Similarly to the **slider**, the **footer** can be edited on the admin footer page.

At the top are the **language select** and the **save button**, below which you can find an interactive preview of the footer. In the first column you can add and edit _emails_, in the second _phone numbers_ and in the last the _location link_. Below these columns, in the second row, are _social links_ that can be edited in the **social dialog**.

<img src="https://raw.githubusercontent.com/asasinmode/humbak/master/api/src/db/scripts/assets/footer-en.png" title="footer overview" alt="footer admin page with an interactive editor">

### socials dialog

Inside of the dialog you can add and edit a select few _social links_ that will show up at the bottom of the footer.

<img src="https://raw.githubusercontent.com/asasinmode/humbak/master/api/src/db/scripts/assets/footer-socials-en.png" title="socials dialog" alt="footer socials dialog with social links editor">

## settings

Lastly, on the admin settings page you can log out and change your admin's account name and password.

<img src="https://raw.githubusercontent.com/asasinmode/humbak/master/api/src/db/scripts/assets/settings-en.png" title="settings page" alt="admin settings page with change name and password forms">
