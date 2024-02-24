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

The cms' main feature is creating pages, which can be done on the admin home page. Once there, you can browse and search all the pages and edit their content, css and meta.
pages table

Located at the top are the home page are a search input and a table. The table contains all the created pages and can be filtered using the input above it. Each page has edit and delete buttons.
