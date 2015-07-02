var techs = require('./techs'),
    enbBemTechs = require('enb-bem-techs'),
    levels = require('../../config').levels
        .filter(function(lvl) {
            return lvl.indexOf('/blocks') > -1 ||
                lvl.indexOf('common') > -1 ||
                lvl.indexOf(process.env.enbPlatform) > -1
        })
        .map(function(lvl) {
            return { path: lvl, check: false };
        });

module.exports = function(config) {
    // placeholder
};
