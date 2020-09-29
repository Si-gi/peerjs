const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')
var https = require('https');
var fs = require('fs');

var httpsOptions = {
  key: fs.readFileSync('conf/key.pem'),
  ca   : fs.readFileSync("conf/csr.pem"),
  cert: fs.readFileSync('conf/cert.pem')
};



/*server.createServer(httpsOptions, app).listen(60000,()=>{
	console.log("working");
})*/
/*https.createServer(httpsOptions, app).listen(60000,()=>{
	console.log("https");
})*/

https.createServer(httpsOptions, function (req, res) {
  console.log("hhtps");
  res.writeHead(200);
  res.end("hello world\n");
}).listen(60000);