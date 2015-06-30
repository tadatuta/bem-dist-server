// TODO:
// показывать блоки из bem-core, других библиотек
// давать возможность выбрать платформу
// предлагать, какие именно технологии необходимо собрать
// предлагать, какие именно уровни необходимо собрать

var fs = require('fs'),
    vm = require('vm'),

    walk = require('bem-walk'),
    walker = walk(['libs/bem-components/common.blocks']),
    naming = new require('bem-naming')(),

    vow = require('./libs/bem-core/common.blocks/vow/vow.vanilla.js'),
    bemtreeFile = fs.readFileSync('./desktop.bundles/index/index.bemtree.js', 'utf-8'),
    ctx = vm.createContext({
        Vow: vow,
        console: console
    }),
    BEMHTML = require('./desktop.bundles/index/index.bemhtml.js').BEMHTML;

vm.runInNewContext(bemtreeFile, ctx);

var BEMTREE = ctx.BEMTREE;

var blocks = [];

walker.on('data', function(data) {
    var type = naming.typeOf(data.bem),
        block = data.block;

    if (['block'].indexOf(type) < 0) return;
    if (blocks.indexOf(block) > -1) return;

    blocks.push(block);

    // if (['block', 'blockMod'].indexOf(type) < 0) return;

    // console.log(data);
    // console.log(naming.typeOf(data.bem));
});

walker.on('end', function() {
    BEMTREE.apply({ blocks: blocks }).then(function(bemjson) {
        fs.writeFileSync('desktop.bundles/index/index.html', BEMHTML.apply(bemjson));
    });
});
