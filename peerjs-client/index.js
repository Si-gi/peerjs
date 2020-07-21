import Peer from 'peerjs';

const peer = new Peer();
const conn = peer.connect('another-peers-id');
conn.on('open', () => {
  conn.send('hi!');
});

peer.on('connection', (conn) => {
    conn.on('data', (data) => {
      // Will print 'hi!'
      console.log(data);
    });
    conn.on('open', () => {
      conn.send('hello!');
    });
  });