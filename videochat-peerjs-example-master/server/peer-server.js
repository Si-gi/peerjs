var fs = require('fs');
var PeerServer = require('peer').PeerServer;

var privateKey  = fs.readFileSync('./../certificates/key.pem', 'utf8');
var certificate = fs.readFileSync('./../certificates/cert.pem', 'utf8');
var server = PeerServer({port: 443,
proxied: true,
ssl: {key: privateKey,
certificate: certificate
}},
() => {
console.log('running peerserver')
});