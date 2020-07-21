const socket = io('ws://127.0.0.1:3000', {transports: ['websocket']}); //location of where server is hosting socket app
socket.on('connect', function () {
    console.log('connected!');
    socket.emit('greet', { message: 'Hello Mr.Server!' });
  });
  socket.on('respond', function (data) {
    console.log(data);
  });  
socket.on('chat-message', data =>{
    console.log(data)
});

const cameraOptions = document.querySelector('.video-options>select');
const video = document.getElementById("lVideo");
const canvas = document.querySelector('canvas');
let streamStarted = false;

const play = document.getElementById("call_button");

const constraints = {
    video: {
      width: {
        min: 320,
        ideal: 460,
        max: 640,
      },
      height: {
        min: 190,
        ideal: 320,
        max: 720
      },
    }
  };
// query DOM
const message = document.getElementById('message'),
      handle = document.getElementById('handle'),
      output = document.getElementById('output'),
      typing = document.getElementById('typing'),
      button =  document.getElementById('button');

      //send typing message
message.addEventListener('keypress', () =>{
    socket.emit('userTyping', handle.value)
})

    //send message to clients
    button.addEventListener('click', () => {
        socket.emit('userMessage', {
            handle: handle.value,
            message:message.value
        })
        document.getElementById('message').value= "";
    })
// Listen for events from the server

    socket.on("userMessage", (data) => {
        typing.innerHTML ="";
        output.innerHTML += '<p> <strong>' + data.handle + ': </strong>' + data.message + '</p>'
    })

    socket.on("userTyping", (data) => {
        typing.innerHTML = '<p><em>' +  data + ' is typing ... </em></p>';
    })

    /* video chat */

    // get the local video & displai with permissions
    const getCameraSelection = async () => {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        const options = videoDevices.map(videoDevice => {
          return `<option value="${videoDevice.deviceId}">${videoDevice.label}</option>`;
        });
        cameraOptions.innerHTML = options.join('');
      };

    play.onclick = () => {
        if (streamStarted) {
          video.play();
          play.classList.add('d-none');

          return;
        }
        if ('mediaDevices' in navigator && navigator.mediaDevices.getUserMedia) {
          const updatedConstraints = {
            ...constraints,
            deviceId: {
              exact: cameraOptions.value
            }
          };
          startStream(updatedConstraints);
        }
      };
      
      const startStream = async (constraints) => {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        handleStream(stream);
      };
      
      
      const handleStream = (stream) => {
        video.srcObject = stream;
        play.classList.add('d-none');
      
      };
      getCameraSelection();

      //create peer
      const hosts= {
          host: '127.0.0.1',
          port: 9000,
          path: '/myapp',
      }
      
      var peer = new Peer('someid', hosts); 

      //display peer id
      peer.on('open', function(){
          document.getElementById('connId').innerHTML=peer.id;
      })

      peer.on('connection', function(connectoin){
          conn = connection;
          peer_id = connection.pee;
          document.getElementById('connId').value = peer_id;
      })

      peer.on('error', function(err){
          console.log(err);
      })

      //onclick with th econnection
      document.getElementById('conn_button').addEventListener('click', function(){
          peer_id = document.getElementById("connId").value;
            if(peer_id){
                conn = peer.connect(peer_id)
            }else{
                alert("enter an id");
            }
        })
