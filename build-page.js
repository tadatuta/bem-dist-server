// TODO:
// показывать блоки из bem-core, других библиотек
// давать возможность выбрать платформу
// предлагать, какие именно уровни необходимо собрать
// предлагать, какие именно технологии необходимо собрать

var fs = require('fs'),
    vm = require('vm'),
    path = require('path'),

    levels = require('./config').levels.map(function(lvl) {
        return path.join('dists', lvl);
    }),
    walk = require('bem-walk'),
    walker = walk(levels),
    naming = new require('bem-naming')(),

    pathToBundles = path.resolve('.', 'static', 'desktop.bundles'),
    bundleName = 'index',
    pathToBundle = path.join(pathToBundles, bundleName),

    vow = require('./static/libs/bem-core/common.blocks/vow/vow.vanilla.js'),
    bemtreeFile = fs.readFileSync(path.join(pathToBundle, bundleName + '.bemtree.js'), 'utf-8'),
    ctx = vm.createContext({
        Vow: vow,
        console: console
    }),
    BEMHTML = require(path.join(pathToBundle, bundleName + '.bemhtml.js')).BEMHTML;

vm.runInNewContext(bemtreeFile, ctx);

var BEMTREE = ctx.BEMTREE;

var blocks = {};

walker.on('data', function(data) {
    var entity = data.entity,
        type = naming.typeOf(entity),
        block = entity.block,
        level = data.level,
        lib = level.split('/')[2];

    blocks[lib] || (blocks[lib] = []);

    // if (['block', 'blockMod'].indexOf(type) < 0) return;
    if (['block'].indexOf(type) < 0) return;
    if (blocks[lib].indexOf(block) > -1) return;

    blocks[lib].push(block);

    // console.log(data);
    // console.log(naming.typeOf(data.bem));
});

walker.on('end', function() {
    BEMTREE.apply({
        block: 'root',
        blocks: blocks
    }).then(function(bemjson) {
        fs.writeFileSync(path.join(pathToBundle, bundleName + '.html'), BEMHTML.apply(bemjson));
    });
});

walker.on('error', function(err) {
    console.log('error', err);
});
