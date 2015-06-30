var techs = {
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
    },
    enbBemTechs = require('enb-bem-techs'),
    levels = [
        { path: 'libs/bem-core/common.blocks', check: false },
        { path: 'libs/bem-core/desktop.blocks', check: false },
        { path: 'libs/bem-components/common.blocks', check: false },
        { path: 'libs/bem-components/desktop.blocks', check: false },
        { path: 'libs/bem-components/design/common.blocks', check: false },
        { path: 'libs/bem-components/design/desktop.blocks', check: false }
    ];

module.exports = function(config) {
    var isProd = process.env.YENV === 'production';

    // placeholder
};
