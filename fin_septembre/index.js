var fs = require('fs');
var url = require('url');


var https = require('https');

const { v4: uuidV4 } = require('uuid')
const express = require('express')
const app = express();
const server = require('http').Server(app)

httpsServer = https.createServer(httpsOptions, app);
httpsServer.listen(60000, () =>{console.log("https working")});
const io = require('socket.io').listen(server);
console.log("start");
var httpsOptions = {
  key: fs.readFileSync('conf/key.pem'),
  ca   : fs.readFileSync("conf/csr.pem"),
  cert: fs.readFileSync('conf/cert.pem')
};
console.log(httpsOptions);

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req,res) => {
	res.render('room',{roomId: req.params.room})
})

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId);
    // messages
    socket.on("message", (message) => {
      //send message to the same room
      io.to(roomId).emit("createMessage", message);
    });

    socket.on("screen",(screen) => {
      io.to(roomId).emit("screenSharing", screen)
    })

    // socket.on("share", (stream) => {
    //   socket.to(roomId).broadcast.emit("screenShared", stream);
    // });

    socket.on("disconnect", () => {
      socket.to(roomId).broadcast.emit("user-disconnected", userId);
    });
  });
});


server.listen(3000,()=>{
	console.log("working");
})
/*https.createServer(httpsOptions, app).listen(60000,()=>{
	console.log("https");
})*/
