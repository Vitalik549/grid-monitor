var http = require('http');
var url = require('url');
var querystring = require('querystring');
var static = require('node-static');
var file = new static.Server('.');
var qs = require('querystring');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const util = require('util');

var urls = [
'http://localhost:8088/json',
'http://10.2.4.155:4444/status',
'http://10.2.4.179:4444/status',
//'http://localhost:8088/json',
//'http://localhost:8088/json',
//'http://localhost:8088/json',
//'http://localhost:8088/json',
//'http://localhost:8088/json',
//'http://localhost:8088/json',
//'http://localhost:8088/json',
//'http://localhost:8088/json',
//'http://localhost:8088/json',
'http://localhost:8088/json'
];


var REQUEST_TIMEOUT = 2000;  
var i = 0;

handleNetErr = function(e) { 
  console.log('HANDLE ERROR' + e);
  return e; 
};

function accept(req, res) {

  //console.log(req.url)
  var body = '';

  if (req.url.startsWith('/grid')) {
    req
        .on('data', function (data) {
          console.log('data');
           body += data;
            if (body.length > 1e6)
                request.connection.destroy();

            console.log(body); 
        });
  };

  if (req.url.startsWith('/grids')) {
    req.on('end', function () {
            console.log('PARSED URLS: ' + urls);

             Promise.all(urls.map(httpGet)).then(texts => {
                    //console.log('\n!!!!TOTAL!!n' + texts + '\n');
                    res.end(JSON.stringify({'data': texts}));
             });
    });

    //console.log('code after promiseAll');
  } else if(req.url =='/json'){
    //console.log('REQUESTED JSON!!!!!!!!!' + i++)
    res.end('{"total":71,"used":0,"queued":0,"pending":0,"browsers":{"chrome":{"60.0":{},"61.0":{}},"firefox":{"54.0":{},"55.0":{}}}}');

  }else if(req.url.startsWith('/gridadd')){
    req.on('end', function () {
            console.log('BODY: ' + body)
            urls.push(body)
            httpGet(body)
              .then(function(response, error) {
                res.end(response);
              });
    });
  }else if(req.url.startsWith('/gridremove')){
    req.on('end', function () {
            console.log('BODY: ' + body)

            var index = urls.indexOf(body);
            console.log('index: ' + index)
            if (index !== -1) {
                urls.splice(index, 1);
            }
            res.end(JSON.stringify(index)); ;
    });
  }   else {
    file.serve(req, res); 
  }

}

function timeout(promise, timeout, callback) {
  return new Promise(function (resolve, reject) {
    promise.then(resolve);

    setTimeout(function () {
      resolve(callback);
    }, timeout);
  });
}


function httpGet(path) {
    console.log('Getting data for path: ' + path);

    return timeout(new Promise(function (resolve, reject) {
            const request = new XMLHttpRequest();
            request.onload = function () {
                var obj = {};
                if (this.status === 200) {
                    obj = JSON.parse(this.responseText);
                }
                obj.url = path;
                var text = JSON.stringify(obj);
                //console.log('\nrequestResult: ' + text)
                resolve(text);

            };
            request.onerror = function () {
                    console.log('\nREQUEST ERROR!!!');
                    resolve(getEmptyObjString(path));
            };
            request.open('GET', path);
            request.send();
            //console.log('send request to path: ' + path);
        }), REQUEST_TIMEOUT, getEmptyObjString(path));
}

function getEmptyObjString(path){
  var obj = {};
  obj.url = path;
  return(JSON.stringify(obj));
}


if (!module.parent) {
  http.createServer(accept).listen(8088);
} else {
  exports.accept = accept;
}

console.log('Server started');