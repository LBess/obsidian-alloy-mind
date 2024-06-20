# Obisidian Time Entry Turner

## Description

A custom plugin I built to help with my usage of the the Obsidian note taking app.

Current features:
1. Organize daily notes from a flat root directory into weekly directories
2. Copy daily notes' dream journal entries into a yearly dream journal note
3. Add up time entries for a given daily note (This is a holdover from my time using the app as a consultant)

## Installation

1. Move the downloaded release zip file into `../YOUR_VAULT/.obsidian/plugins`
2. Unzip the release file
3. Run `yarn install`

## Build

1. Run `yarn build`

## Deploy

1. Set the OBSIDIAN environment variable to the root directory of the Obsidian vault you want to deploy to.
2. Run `yarn build:deploy`

## Debug

Type "ctrl + shift + i" on Windows or "option + cmd + i" on Mac in the Obsidian Vault to open the console

## TODO:

1. Github Action to create a Release on merge to `main`
