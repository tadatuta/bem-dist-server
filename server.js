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
        conf = fs.readFileSync('.enb/make.js', 'utf8'),
        confArr = conf.split(placeholder),
        distConf = buildDistConfig(nodeName, blocks);

    confArr.splice(1, 0, placeholder, '\n\n', distConf);

    fs.writeFileSync('.enb/make.js', confArr.join(''));

    // console.log(confArr.join(''));
}

function buildDistConfig(nodeName, blocks) {
    return [
        "    config.nodes('" + nodeName + "', function(nodeConfig) {",
        "        nodeConfig.addTechs([",
        "            [enbBemTechs.levels, { levels: levels }],",
        "            [require('./techs/levels-to-bemdecl.js'), {",
        "                filter: function(item) {",
        "                    return [" + blocks.map(function(i) { return "'" + i + "'" }).join(',') + "]",
        "                        .indexOf(item) > -1;",
        "                }",
        "            }],",
        "            [enbBemTechs.deps],",
        "            [enbBemTechs.files],",
        "",
        "            // css",
        "            [techs.cssStylus, { target: '?.noprefix.css' }],",
        "            [techs.cssAutoprefixer, {",
        "                sourceTarget: '?.noprefix.css',",
        "                destTarget: '?.css',",
        "                browserSupport: ['last 2 versions', 'ie 10', 'opera 12.16']",
        "            }],",
        "",
        "            // js",
        "            [techs.browserJs],",
        "            [techs.prependYm, { source: '?.browser.js' }],",
        "",
        "            // borschik",
        "            [techs.borschik, { sourceTarget: '?.js', destTarget: '?.min.js', freeze: true, minify: true }],",
        "            [techs.borschik, { sourceTarget: '?.css', destTarget: '?.min.css', tech: 'cleancss', freeze: true, minify: true }]",
        "        ]);",
        "",
        "        nodeConfig.addTargets(['?.min.css', '?.min.js']);",
        "    });"
    ].join('\n');
}

function buildDownloadLinks(timestamp) {
    return [
        'js',
        'css',
        'min.js',
        'min.css'
    ].map(function(tech) {
        return '<a href="/dist' + timestamp + '/dist' + timestamp + '.' + tech + '">bem-components.' + tech + '</a>';
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

        // console.log(blocks);

        updateConfig('dist' + timestamp, blocks);

        var make = spawn('/usr/bin/env', ['enb', 'make', 'dist' + timestamp, '-n'], {
            cwd: __dirname
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
            // res.end('<pre>' + JSON.stringify(require('./dist' + timestamp + '/dist' + timestamp + '.bemdecl.js').blocks, null, 4) + '</pre>');
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
        return res.end(fs.readFileSync(path.join(__dirname, 'desktop.bundles', 'index', 'index.html'), 'utf8'))
    }

    if (/^\/_index\.(js|css)/.test(req.url)) {
        return res.end(fs.readFileSync(path.join(__dirname, 'desktop.bundles', 'index', req.url), 'utf8'))
    }

    var pathname = url.parse(req.url).pathname;
    if (pathname === '/') return routes['/'](req, res);
    if (/^\/dist/.test(pathname)) {
        req.pathname = pathname;
        return routes['/dist'](req, res);
    }
    res.writeHead(404);
    res.end('Not found');
}).listen(9000);

console.log('Server running at http://localhost:9000/');
