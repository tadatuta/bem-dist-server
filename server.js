var fs = require('fs'),
    path = require('path'),
    net = require('net'),
    http = require('http'),
    url = require('url'),
    querystring = require('querystring'),
    spawn = require('child_process').spawn,
    cache = {},
    port = process.env.PORT || 9000,
    techs = require('./config').techs,
    distConfigTmpl = fs.readFileSync('dist-config.tmpl.js', 'utf8');

try {
    cache = require('./cache.json');
} catch(e) {}

function updateConfig(nodeName, blocks) {
    var placeholder = '// placeholder',
        conf = fs.readFileSync('dists/.enb/make.js', 'utf8'),
        confArr = conf.split(placeholder),
        distConf = distConfigTmpl
            .replace('<%nodeName%>', nodeName)
            .replace('<%blocks%>', blocks.map(function(i) { return "'" + i + "'" }).join(','));

    confArr.splice(1, 0, placeholder, '\n\n', distConf);

    fs.writeFileSync('dists/.enb/make.js', confArr.join(''));
}

function buildDownloadLinks(timestamp) {
    return '<a href="/dists/dist' + timestamp + '.gzip">dist' + timestamp + '.gzip</a><br>' +
        techs.map(function(tech) {
            return '<a href="/dists/dist' + timestamp + '/dist' + timestamp + '.' + tech + '">dist' + timestamp + '.' + tech + '</a>';
        }).join('<br>');
}

var routes = {
    '/': function(req, res) {
        var queryStr = url.parse(req.url).query,
            timestamp;

        console.log(queryStr);

        if (timestamp = cache[queryStr]) {
            console.log('cache hit');
            res.end(buildDownloadLinks(timestamp));
            return;
        }

        if (!queryStr || queryStr.indexOf('blocks') < 0) {
            res.writeHead(404);
            return res.end();
        }

        timestamp = +(new Date());

        query = querystring.parse(queryStr);

        var blocks = [].concat(query.blocks),
            distFolder = 'dist' + timestamp;

        // console.log(blocks);

        updateConfig(distFolder, blocks);

        // TODO: think about using ENB via JS API
        var env = process.env;
        env.enbPlatform = query.platform;

        var make = spawn('/usr/bin/env', ['enb', 'make', distFolder, '-n'], {
            cwd: path.join(__dirname, 'dists'),
            env: env
        });

        make.stdout.on('data', function(data) {
            console.log('stdout: ' + data);
        });

        make.stderr.on('data', function(data) {
            console.log('stderr: ' + data);
        });

        make.on('close', function(code) {
            console.log('make exited with code ' + code);
            cache[queryStr] = timestamp;

            var tar = spawn('tar', ['-zcvf', 'dist' + timestamp + '.gzip', './dist' + timestamp], {
                cwd: path.join(__dirname, 'dists')
            });

            tar.on('close', function(code) {
                console.log('tar exited with code ' + code);

                if (code !== 0) {
                    res.writeHead(500, {'Content-Type': 'text/html'});
                    return res.end('Error');
                }

                fs.writeFileSync('cache.json', JSON.stringify(cache, null, 4));
                res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
                res.end(buildDownloadLinks(timestamp));
                // res.end('<pre>' + JSON.stringify(require('./dists/dist' + timestamp + '/dist' + timestamp + '.bemdecl.js').blocks, null, 4) + '</pre>');
            });
        });
    },
    '/dist': function(req, res) {
        var pathToFile = path.join(__dirname, req.pathname)
        console.log('req.pathname', pathToFile);
        if (!fs.existsSync(pathToFile)) {
            res.writeHead(404);
            return res.end('Not found');
        }

        res.writeHead(200, {
            'Content-Type': req.pathname.indexOf('gzip') > -1 ?
                'application/x-gtar' : 'text/plain;charset=utf-8'
            });

        res.end(fs.readFileSync(pathToFile));
    }
}

var server = http.createServer(function (req, res) {
    if (req.url === '/') {
        res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
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
}).listen(port, function() {
    // downgrade process user to owner of this file
    return fs.stat(__filename, function(err, stats) {
        if (err) throw err;
        return process.setuid(stats.uid);
    });

    console.log('Server running at http://localhost:' + port + '/');
});

// port is a UNIX socket file
if (isNaN(parseInt(port))) {
    server.on('listening', function() {
        // set permissions
        return fs.chmod(port, 0777);
    });

    // double-check EADDRINUSE
    server.on('error', function(e) {
        if (e.code !== 'EADDRINUSE') throw e;
        net.connect({ path: port }, function() {
            // really in use: re-throw
            throw e;
        }).on('error', function(e) {
            if (e.code !== 'ECONNREFUSED') throw e;
            // not in use: delete it and re-listen
            fs.unlinkSync(port);
            server.listen(port);
        });
    });
}
