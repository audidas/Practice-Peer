import IO from 'socket.io-client';
import Peer from 'react-native-peerjs';
import {ADD_STREAM, MY_STREAM, ADD_REMOTE_STREAM} from './types';

// * API URI  */
export const API_URI = 'http://192.168.0.19:5000';

//* Socket config *//
export const socket = IO(`${API_URI}`, {
  forceNew: true,
});

socket.on('connection', () => console.log('Connected client'));

// * Peer Config */
const peerServer = new Peer(undefined, {
  host: '192.168.0.19',
  secure: false,
  port: 5000,
  path: '/mypeer',
});

peerServer.on('error', error => {
  console.log(error);
});

export const joinRoom = stream => async dispatch => {
  console.log('joinStream first', stream);

  const roomID = 'asdasdhirghalrguh12hdhfhj';

  // Set my own stream
  dispatch({type: MY_STREAM, payload: stream});

  console.log('first Dispatch End');

  // Open a connection to our server
  peerServer.on('open', userId => {
    console.log('first Peer Server open');

    socket.emit('join-room', {userId, roomID});
  });

  socket.on('user-connected', userId => {
    console.log('user connected');

    connectToNewUser(userId, stream, dispatch);
  });

  // Receive a call
  peerServer.on('call', call => {
    call.answer(stream);
    // stream back the call
    call.on('stream', stream => {
      dispatch({type: ADD_STREAM, payload: stream});
    });
  });
};

function connectToNewUser(userId, stream, dispatch) {
  const call = peerServer.call(userId, stream);

  call.on('stream', remoteVideoStream => {
    if (remoteVideoStream) {
      dispatch({type: ADD_REMOTE_STREAM, payload: remoteVideoStream});
    }
  });
}
