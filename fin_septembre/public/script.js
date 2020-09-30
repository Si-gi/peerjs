const socket = io('/')
const myPeer = new Peer(undefined, {
  host: '/',
  port: '3001'
})
var myUserId = "";
myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})
var sharing = false;

  
const videoGrid = document.getElementById('video-grid')
var outputDevices = [];
var medias = []
navigator.mediaDevices.enumerateDevices()
.then(function(devices) {
  devices.forEach(function(device) {
    if(device.kind == "audioouput" ){
      medias_output[] = {"label": device.label, "id" : device.deviceId}
    }
    console.log(device.kind + ": " + device.label +
                " id = " + device.deviceId);
  });
})

//const myScreen = document.createElement('video');
//myScreen.muted = true;

const myVideo = document.createElement('video');
//myVideo.muted = true
const peers = {};

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  addCamStream(myVideo, stream);
  
  myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addCamStream(video, userVideoStream)
    })
  })
  
  socket.on('user-connected', (userId) => {
    myUserId = userId; //FIXME:
    console.log("User Connected " + userId)
    connectToNewUser(userId, stream)

  });
  // input value
  let text = $("input");
  // when press enter send message
  $("html").keydown(function (e) {
    if (e.which == 13 && text.val().length !== 0) {
      socket.emit("message", text.val());
      text.val("");
    }
  });
  socket.on("createMessage", (message) => {
    $("ul").append(`<li class="message"><b>user</b><br/>${message}</li>`);
    scrollToBottom();
  });
});
  socket.on('user-disconnected', userId => {
	  if (peers[userId]) peers[userId].close()
  })


function addCamStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}



function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addCamStream(video, userVideoStream)
  })
  
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}

/*function shareScreen(captureStream){
  myPeer.on('call', call => {
    call.answer(captureStream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      getStream(video, userVideoStream)
    })
  });
}
*/

async function screenCapture() {
  if(!sharing){
    sharing = true;
    let displayMediaOptions = {
      video: {
        cursor: "always"
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100
      }
    };
    const screenElem = document.getElementById('screen-shared');
    
    try {
      captureStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
      let myVideo = document.createElement('video');
      myVideo.id ="myScreenCapture"
      myVideo.srcObject = captureStream ;
      myVideo.setAttribute("controls", "");
      myVideo.addEventListener('loadedmetadata', () => {
        myVideo.play()
      })
      screenElem.append(myVideo);
      
      myPeer.call(myUserId, captureStream);  
      document.getElementById("screen-text").textContent="stop share";
    } catch(err) {
      console.log(err);
    }
    
  }else{
    
    myScreen = document.getElementById("myScreenCapture");
    let tracks = myScreen.srcObject.getTracks();

    tracks.forEach(track => track.stop());
    myScreen.srcObject = null;
    myScreen.remove();
    document.getElementById("screen-text").textContent="Screen share";
    sharing = false;
  }
}    


const scrollToBottom = () => {
  var d = $(".main__chat_window");
  d.scrollTop(d.prop("scrollHeight"));
};

const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};

const playStop = () => {
  console.log("object");
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `;
  document.querySelector(".main__mute_button").innerHTML = html;
};

const exit = () => {
  window.location.href = "https://google.com";
};

// const copyInfo = () => {
//   navigator.clipboard.writeText(window.location.href);
// };

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `;
  document.querySelector(".main__mute_button").innerHTML = html;
};

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `;
  document.querySelector(".main__video_button").innerHTML = html;
};

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `;
  document.querySelector(".main__video_button").innerHTML = html;
};

function dumpOptionsInfo() {
  const videoTrack = screenElem.srcObject.getVideoTracks()[0];
 
  console.info("Track settings:");
  console.info(JSON.stringify(videoTrack.getSettings(), null, 2));
  console.info("Track constraints:");
  console.info(JSON.stringify(videoTrack.getConstraints(), null, 2));
}

function stopCapture(evt) {
  let tracks = screenElem.srcObject.getTracks();

  tracks.forEach(track => track.stop());
  screenElem.srcObject = null;
}