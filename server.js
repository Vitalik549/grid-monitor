var http = require('http');
var url = require('url');
var querystring = require('querystring');
var nodeStatic = require('node-static');
var file = new nodeStatic.Server('.');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const util = require('util');

var fs = require('fs');
var xpath = require('xpath');
var dom = require('xmldom').DOMParser;

var REQUEST_TIMEOUT = 3000;
const GRID_XML = 'grids.xml';

var urls = fetchNodesFromXml(GRID_XML);

function accept(req, res) {
    var body = '';

    if (req.url.startsWith('/grid')) {
        req.on('data', function (data) {
            console.log('data');
            body += data;
            if (body.length > 1e6)
                request.connection.destroy();

            console.log(body);
        });
    }

    if (req.url.startsWith('/grids')) {
        req.on('end', function () {
            console.log('PARSED URLS: ' + urls);
            Promise.all(urls.map(httpGet)).then(texts =>
                res.end(JSON.stringify({'data': texts}))
            );
        });
    } else if (req.url === '/json') {
        res.end('{"total":71,"used":0,"queued":0,"pending":0,"browsers":{"chrome":{"60.0":{},"61.0":{}},"firefox":{"54.0":{},"55.0":{}}}}');
    } else if (req.url.startsWith('/gridadd')) {
        req.on('end', function () {
            urls.push(body);
            httpGet(body).then(function (response, error) {
                res.end(response);
            });
        });
    } else if (req.url.startsWith('/gridremove')) {
        req.on('end', function () {
            var index = urls.indexOf(body);
            if (index !== -1) {
                urls.splice(index, 1);
            }
            res.end(JSON.stringify(index));
        });
    } else {
        file.serve(req, res);
    }
}

function httpGet(path) {
    console.log('Getting data for path: ' + path);

    return new Promise(function (resolve, reject) {
        const request = new XMLHttpRequest();

        setTimeout(function () {
            if (request.readyState !== 4) {
                request.abort();
                console.log(util.format('Request aborted by timeout %s: %s', REQUEST_TIMEOUT, path));
            }
        }, REQUEST_TIMEOUT);

        request.onload = function () {
            var obj = {};
            if (this.status === 200) {
                obj = JSON.parse(this.responseText);
            }
            obj.url = path;
            resolve(JSON.stringify(obj));

        };
        request.onerror = function () {
            var obj = {};
            obj.url = path;
            resolve(JSON.stringify(obj));
        };
        request.open('GET', path);
        request.send();
    });
}

function fetchNodesFromXml(pathToFile) {
    let nodes = [];
    let data = fs.readFileSync(pathToFile, {encoding: 'UTF-8'});
    let doc = new dom().parseFromString(data);
    let childNodes = xpath.select('//host', doc);

    childNodes.forEach(function (node) {
        let ip = xpath.select1("@name", node).value;
        let port = xpath.select1("@port", node).value;
        nodes.push('http://' + ip + ':' + port + "/status")
    });

    return nodes;
}

if (!module.parent) {
    http.createServer(accept).listen(8088);
} else {
    exports.accept = accept;
}

console.log('Server started');