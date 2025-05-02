# quick-npm

Quick start template to rapidly develop NPM packages with speed, and automations.

## Install

```bash
bun add @rayriffy/quick-npm
```

## Setting up

1. Allow GitHub Actions to create pull request
2. Generate NPM authotization token into `NPM_TOKEN` secret

## Publishing

This repository has been configured to automatically publish NPM packages by [Changesets](https://github.com/changesets/changesets). Run `bun changeset` command to publishing your changes before commit.
