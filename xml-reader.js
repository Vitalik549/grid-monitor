const fs = require('fs');
const xpath = require('xpath');
const dom = require('xmldom').DOMParser;

 function fetchUrlsFromXml(pathToFile) {
    let nodes = [];
    let data = fs.readFileSync(pathToFile, {encoding: 'UTF-8'});
    let doc = new dom().parseFromString(data);
    let childNodes = xpath.select('//host', doc);

    childNodes.forEach(function (node) {
        let ip = xpath.select1("@name", node).value;
        let port = xpath.select1("@port", node).value;
        nodes.push('http://' + ip + ':' + port)
    });

    return nodes;
}


module.exports.fetchUrlsFromXml = fetchUrlsFromXml;