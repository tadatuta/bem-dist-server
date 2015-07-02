var techs = require('./techs'),
    enbBemTechs = require('enb-bem-techs'),
    levels = require('./levels');

module.exports = function(config) {
    // placeholder

    config.nodes('dist1435845357690', function(nodeConfig) {
        nodeConfig.addTechs([
            [enbBemTechs.levels, { levels: levels }],
            [require('./techs/levels-to-bemdecl.js'), {
                target : '.tmp.bemdecl.js',
                filter: function(item) {
                    return ['attach','button','checkbox','checkbox-group','control','control-group','dropdown','icon','image','input','link','menu','menu-item','modal','popup','progressbar','radio','radio-group','select','spin','textarea','z-index-group','mq','row','variables']
                        .indexOf(item) > -1;
                }
            }],
            [enbBemTechs.deps, { bemdeclFile : '.tmp.bemdecl.js', target : '.tmp.deps.js' }],
            [enbBemTechs.files, { depsFile : '.tmp.deps.js' }],
            [techs.stylusWithAutoprefixer, {
                target : '?.dev.css',
                browsers : [
                   'last 2 versions',
                   'ie 10',
                   'ff 24',
                   'opera 12.16'
               ]
            }],
            [techs.cssStylus, {
                target : '?.dev.ie.css',
                sourceSuffixes : ['styl', 'ie.styl']
            }],
            [enbBemTechs.depsByTechToBemdecl, {
                target : '.tmp.js-js.bemdecl.js',
                sourceTech : 'js',
                destTech : 'js'
            }],
            [enbBemTechs.mergeBemdecl, {
                sources : ['.tmp.bemdecl.js', '.tmp.js-js.bemdecl.js'],
                target : '.tmp.js.bemdecl.js'
            }],
            [enbBemTechs.deps, {
                target : '.tmp.js.deps.js',
                bemdeclFile : '.tmp.js.bemdecl.js'
            }],
            [enbBemTechs.files, {
                depsFile : '.tmp.js.deps.js',
                filesTarget : '.tmp.js.files',
                dirsTarget : '.tmp.js.dirs'
            }],
            [techs.browserJs, {
                filesTarget : '.tmp.js.files',
                target : '.tmp.pre-source.js'
            }],
            [techs.borschik, { source : '.tmp.pre-source.js', target : '.tmp.source.js', freeze : false, minify : false }],
            [techs.prependYm, {
                source : '.tmp.source.js',
                target : '?.dev.js'
            }],
            [techs.bemhtml, { target : '?.dev.bemhtml.js', devMode : false }],
            [techs.bhServerInclude, { target : '?.dev.bh.js', jsAttrName : 'data-bem', jsAttrScheme : 'json', mimic : ['BH', 'BEMHTML'] }],
            [techs.bhClient, { target : '.tmp.browser.bh.js', jsAttrName : 'data-bem', jsAttrScheme : 'json', mimic : ['BH', 'BEMHTML'] }],
            [techs.fileMerge, {
                target : '?.dev.js+bemhtml.js',
                sources : ['?.dev.js', '?.dev.bemhtml.js']
            }],
            [techs.fileMerge, {
                target : '?.dev.js+bh.js',
                sources : ['?.dev.js', '.tmp.browser.bh.js']
            }],
            [techs.borschik, { source : '?.dev.css', target : '?.css', tech : 'cleancss', freeze : true, minify : true }],
            [techs.borschik, { source : '?.dev.ie.css', target : '?.ie.css', tech : 'cleancss', freeze : true, minify : true }],
            [techs.borschik, { source : '?.dev.js', target : '?.js', freeze : true, minify : true }],
            [techs.borschik, { source : '?.dev.bemhtml.js', target : '?.bemhtml.js', freeze : true, minify : true }],
            [techs.borschik, { source : '?.dev.bh.js', target : '?.bh.js', freeze : true, minify : true }],
            [techs.borschik, { source : '?.dev.js+bemhtml.js', target : '?.js+bemhtml.js', freeze : true, minify : true }],
            [techs.borschik, { source : '?.dev.js+bh.js', target : '?.js+bh.js', freeze : true, minify : true }]
        ]);

        nodeConfig.addTargets([
            '?.css', '?.ie.css', '?.js', '?.bemhtml.js', '?.bh.js', '?.js+bemhtml.js', '?.js+bh.js'
        ]);
    });
};
