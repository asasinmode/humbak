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
