var fs = require('fs'),
    path = require('path'),
    http = require('http'),
    url = require('url'),
    spawn = require('child_process').spawn,
    cache = {};

try {
    cache = require('./cache.json');
} catch(e) {}

function updateConfig(nodeName, blocks) {
    var placeholder = '// placeholder',
        conf = fs.readFileSync('dists/.enb/make.js', 'utf8'),
        confArr = conf.split(placeholder),
        distConf = buildDistConfig(nodeName, blocks);

    confArr.splice(1, 0, placeholder, '\n\n', distConf);

    fs.writeFileSync('dists/.enb/make.js', confArr.join(''));
}

function buildDistConfig(nodeName, blocks) {
    return [
        "    config.nodes('" + nodeName + "', function(nodeConfig) {",
        "        nodeConfig.addTechs([",
        "            [enbBemTechs.levels, { levels: levels }],",
        "            [require('./techs/levels-to-bemdecl.js'), {",
        "                target : '.tmp.bemdecl.js',",
        "                filter: function(item) {",
        "                    return [" + blocks.map(function(i) { return "'" + i + "'" }).join(',') + "]",
        "                        .indexOf(item) > -1;",
        "                }",
        "            }],",
        "            [enbBemTechs.deps, { bemdeclFile : '.tmp.bemdecl.js', target : '.tmp.deps.js' }],",
        "            [enbBemTechs.files, { depsFile : '.tmp.deps.js' }],",
        "            [techs.stylusWithAutoprefixer, {",
        "                target : '?.dev.css',",
        "                browsers : [",
        "                   'last 2 versions',",
        "                   'ie 10',",
        "                   'ff 24',",
        "                   'opera 12.16'",
        "               ]",
        "            }],",
        "            [techs.cssStylus, {",
        "                target : '?.dev.ie.css',",
        "                sourceSuffixes : ['styl', 'ie.styl']",
        "            }],",
        "            [enbBemTechs.depsByTechToBemdecl, {",
        "                target : '.tmp.js-js.bemdecl.js',",
        "                sourceTech : 'js',",
        "                destTech : 'js'",
        "            }],",
        "            [enbBemTechs.mergeBemdecl, {",
        "                sources : ['.tmp.bemdecl.js', '.tmp.js-js.bemdecl.js'],",
        "                target : '.tmp.js.bemdecl.js'",
        "            }],",
        "            [enbBemTechs.deps, {",
        "                target : '.tmp.js.deps.js',",
        "                bemdeclFile : '.tmp.js.bemdecl.js'",
        "            }],",
        "            [enbBemTechs.files, {",
        "                depsFile : '.tmp.js.deps.js',",
        "                filesTarget : '.tmp.js.files',",
        "                dirsTarget : '.tmp.js.dirs'",
        "            }],",
        "            [techs.browserJs, {",
        "                filesTarget : '.tmp.js.files',",
        "                target : '.tmp.pre-source.js'",
        "            }],",
        "            [techs.borschik, { source : '.tmp.pre-source.js', target : '.tmp.source.js', freeze : false, minify : false }],",
        "            [techs.prependYm, {",
        "                source : '.tmp.source.js',",
        "                target : '?.dev.js'",
        "            }],",
        "            [techs.bemhtml, { target : '?.dev.bemhtml.js', devMode : false }],",
        "            [techs.bhServerInclude, { target : '?.dev.bh.js', jsAttrName : 'data-bem', jsAttrScheme : 'json', mimic : ['BH', 'BEMHTML'] }],",
        "            [techs.bhClient, { target : '.tmp.browser.bh.js', jsAttrName : 'data-bem', jsAttrScheme : 'json', mimic : ['BH', 'BEMHTML'] }],",
        "            [techs.fileMerge, {",
        "                target : '?.dev.js+bemhtml.js',",
        "                sources : ['?.dev.js', '?.dev.bemhtml.js']",
        "            }],",
        "            [techs.fileMerge, {",
        "                target : '?.dev.js+bh.js',",
        "                sources : ['?.dev.js', '.tmp.browser.bh.js']",
        "            }],",
        "            [techs.borschik, { source : '?.dev.css', target : '?.css', tech : 'cleancss', freeze : true, minify : true }],",
        "            [techs.borschik, { source : '?.dev.ie.css', target : '?.ie.css', tech : 'cleancss', freeze : true, minify : true }],",
        "            [techs.borschik, { source : '?.dev.js', target : '?.js', freeze : true, minify : true }],",
        "            [techs.borschik, { source : '?.dev.bemhtml.js', target : '?.bemhtml.js', freeze : true, minify : true }],",
        "            [techs.borschik, { source : '?.dev.bh.js', target : '?.bh.js', freeze : true, minify : true }],",
        "            [techs.borschik, { source : '?.dev.js+bemhtml.js', target : '?.js+bemhtml.js', freeze : true, minify : true }],",
        "            [techs.borschik, { source : '?.dev.js+bh.js', target : '?.js+bh.js', freeze : true, minify : true }]",
        "        ]);",
        "",
        "        nodeConfig.addTargets([",
        "            '?.css', '?.ie.css', '?.js', '?.bemhtml.js', '?.bh.js', '?.js+bemhtml.js', '?.js+bh.js'",
        "        ]);",
        "    });"
    ].join('\n');
}

function buildDownloadLinks(timestamp) {
    return [
        'css',
        'ie.css',

        'js',
        'js+bemhtml.js',
        'js+bh.js',

        'bemhtml.js',
        'bh.js',

        'dev.css',
        'dev.ie.css',

        'dev.js',
        'dev.js+bemhtml.js',
        'dev.js+bh.js',

        'dev.bemhtml.js',
        'dev.bh.js'
    ].map(function(tech) {
        return '<a href="/dists/dist' + timestamp + '/dist' + timestamp + '.' + tech + '">dist' + timestamp + '.' + tech + '</a>';
    }).join('<br>');
}

var routes = {
    '/': function(req, res) {
        var query = url.parse(req.url).query,
            timestamp;

        if (timestamp = cache[query]) {
            console.log('cache hit');
            res.end(buildDownloadLinks(timestamp));
            return;
        }

        if (!query || query.indexOf('blocks') < 0) {
            res.writeHead(404);
            return res.end();
        }

        timestamp = +(new Date());

        var blocks = query.split('&').map(function(item) {
            return item.split('=')[1];
        });

        var distFolder = 'dist' + timestamp;

        // console.log(blocks);

        updateConfig(distFolder, blocks);

        var make = spawn('/usr/bin/env', ['enb', 'make', distFolder, '-n'], {
            cwd: path.join(__dirname, 'dists')
        });

        make.stdout.on('data', function(data) {
            console.log('stdout: ' + data);
        });

        make.stderr.on('data', function(data) {
            console.log('stderr: ' + data);
        });

        make.on('close', function(code) {
            console.log('child process exited with code ' + code);
            cache[query] = timestamp;
            fs.writeFileSync('cache.json', JSON.stringify(cache, null, 4));
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(buildDownloadLinks(timestamp));
            // res.end('<pre>' + JSON.stringify(require('./dists/dist' + timestamp + '/dist' + timestamp + '.bemdecl.js').blocks, null, 4) + '</pre>');
        });
    },
    '/dist': function(req, res) {
        var pathToFile = path.join(__dirname, req.pathname)
        console.log('req.pathname', pathToFile);
        if (!fs.existsSync(pathToFile)) {
            res.writeHead(404);
            return res.end('Not found');
        }

        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end(fs.readFileSync(pathToFile, 'utf8'));
    }
}

http.createServer(function (req, res) {
    if (req.url === '/') {
        res.writeHead(200, {'Content-Type': 'text/html'});
        return res.end(fs.readFileSync(path.join(__dirname, 'static', 'desktop.bundles', 'index', 'index.html'), 'utf8'))
    }

    if (/^\/_index\.(js|css)/.test(req.url)) {
        return res.end(fs.readFileSync(path.join(__dirname, 'static', 'desktop.bundles', 'index', req.url), 'utf8'))
    }

    if (req.url === '/favicon.ico') {
        return res.end(fs.readFileSync(path.join(__dirname, 'static', req.url)));
    }

    var pathname = url.parse(req.url).pathname;
    if (pathname === '/') return routes['/'](req, res);
    if (/^\/dists\/dist/.test(pathname)) {
        req.pathname = pathname;
        return routes['/dist'](req, res);
    }
    res.writeHead(404);
    res.end('Not found');
}).listen(9000);

console.log('Server running at http://localhost:9000/');
