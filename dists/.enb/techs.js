module.exports = {
    // essential
    fileProvider: require('enb/techs/file-provider'),
    fileMerge: require('enb/techs/file-merge'),

    // optimization
    borschik: require('enb-borschik/techs/borschik'),

    // css
    cssStylus: require('enb-stylus/techs/css-stylus'),
    stylusWithAutoprefixer: require('enb-stylus/techs/css-stylus-with-autoprefixer'),
    cssAutoprefixer: require('enb-autoprefixer/techs/css-autoprefixer'),

    // js
    browserJs: require('enb-diverse-js/techs/browser-js'),
    prependYm: require('enb-modules/techs/prepend-modules'),

    // bemtree
    bemtree: require('enb-bemxjst/techs/bemtree'),

    // bemhtml
    bemhtml: require('enb-bemxjst/techs/bemhtml'),

    // bh
    bhServerInclude: require('enb-bh/techs/bh-server-include'),
    bhClient: require('enb-bh/techs/bh-client')
};
