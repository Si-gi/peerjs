const express = require('express')
const app = express()
const server = require('https').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')
var https = require('https');
var fs = require('fs');

var httpsOptions = {
  key: fs.readFileSync('conf/key.pem'),
  ca   : fs.readFileSync("conf/csr.pem"),
  cert: fs.readFileSync('conf/cert.pem')
};
var httpsServer = https.createServer(httpsOptions, app);
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


server.createServer(httpsOptions, app).listen(60000,()=>{
	console.log("working");
})
httpsServer.listen(60000);
/*https.createServer(httpsOptions, app).listen(60000,()=>{
	console.log("https");
})*/