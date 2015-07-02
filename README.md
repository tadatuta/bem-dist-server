# bem-dist-server

## Usage

```sh
git clone https://github.com/tadatuta/bem-dist-server.git
cd bem-dist-server
npm i
npm run deps
npm run build
npm start
```

## Anatomy

Sources of web interface are in `static` folder. `ENB` is used to build bundles. HTML is generated with `build-page.js` which introspects all the levels from `config.js` and builds a list of found blocks.

`server.js` serves static and generate `ENB` configs in `dists` folder to build assets for selected blocks.

## Add a library

1) Add it to dists/bower.json and install:
```sh
cd dists
../node_modules/.bin/bower i library-name --save
```

2) Add all provided levels to `config.js` in proper order.
3) Optionally add path to library documentation to `libs-to-docs.json`.
