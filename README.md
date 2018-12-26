# Vuejs Stomp Ws

[![npm](https://img.shields.io/npm/v/stomp-ws.svg)](https://www.npmjs.com/package/stomp-ws) [![vue2](https://img.shields.io/badge/vue-2.x-brightgreen.svg)](https://vuejs.org/)

> This library provides a STOMP client for VueJS app (using Web Sockets)

## Installation

```bash
npm install --save stomp-ws
```

## Usage

### Bundler (Webpack, Rollup)

```js
import Vue from 'vue'
import Vuejs Stomp Ws from 'stomp-ws'
// You need a specific loader for CSS files like https://github.com/webpack/css-loader
import 'stomp-ws/dist/stomp-ws.css'

Vue.use(Vuejs Stomp Ws)
```

### Browser

```html
<!-- Include after Vue -->
<!-- Local files -->
<link rel="stylesheet" href="stomp-ws/dist/stomp-ws.css"></link>
<script src="stomp-ws/dist/stomp-ws.js"></script>

<!-- From CDN -->
<link rel="stylesheet" href="https://unpkg.com/stomp-ws/dist/stomp-ws.css"></link>
<script src="https://unpkg.com/stomp-ws"></script>
```

## Development

### Launch visual tests

```bash
npm run dev
```

### Launch Karma with coverage

```bash
npm run dev:coverage
```

### Build

Bundle the js and css of to the `dist` folder:

```bash
npm run build
```


## Publishing

The `prepublish` hook will ensure dist files are created before publishing. This
way you don't need to commit them in your repository.

```bash
# Bump the version first
# It'll also commit it and create a tag
npm version
# Push the bumped package and tags
git push --follow-tags
# Ship it 🚀
npm publish
```

## License

[MIT](http://opensource.org/licenses/MIT)
