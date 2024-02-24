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
pages table

Located at the top are the home page are a search input and a table. The table contains all the created pages and can be filtered using the input above it. Each page has **edit** and **delete** buttons.

<img src="https://raw.githubusercontent.com/asasinmode/humbak/master/api/src/db/scripts/assets/pages-table-en.png" title="pages table" alt="pages table on admin page">

## page form

Below the table there is a form consisting of 4 text fields, the **editor** and the **preview box**. Between the _editor_ and the _preview box_ are **control buttons**. Going from top to bottom, the _control buttons_ are: **editor mode select**, **content formatting**, **snippets** and **Humbak Files**. The last, gray button in the middle can be used to resize the _editor_. Lastly, below the _editor_ there are the **clear** and **save** buttons.

<img src="https://raw.githubusercontent.com/asasinmode/humbak/master/api/src/db/scripts/assets/pages-table-en.png" title="content form" alt="content form on admin page">

Use the editor mode select to switch between editing page's _html_, _css_ and _meta_. Note that _meta_ should be a valid JSON array containing objects that will be mapped to meta tags, for example `{ "name": "description", "content": "My page's description" }` will create a tag `<meta name="description" content="My page's description">`.

## humbak files

The fourth _control button_, opens the **humbak files dialog**, inside of which you can browse and search all of your files and open their preview or copy their html tag.

<img src="https://raw.githubusercontent.com/asasinmode/humbak/master/api/src/db/scripts/assets/pages-humbak-files-en.png" title="humbak files dialog" alt="dialog with list of files">

_Humbak files_ can be uploaded on the files page and have some special features that are described in the humbak files section. To make their features work, inside the page html you use them through a special tag `<HumbakFile fid="1">`. They require a special **fid** attribute that contains the target _humbak file's_ id and accept all valid html attributes, such as _class_ or _style_.
