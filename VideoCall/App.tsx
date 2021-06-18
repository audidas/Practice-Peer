import React, {useCallback, useEffect} from 'react';
import {Text, View, Dimensions, ScrollView} from 'react-native';
import {RTCView, mediaDevices} from 'react-native-webrtc';

import {connect} from 'react-redux';
import {joinRoom} from './src/store/actions/videoActions';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('screen');

const App = ({joinRoom, video}) => {
  const getStream = useCallback(() => {
    let isFront = true;
    mediaDevices.enumerateDevices().then(sourceInfos => {
      let videoSourceId;
      for (let i = 0; i < sourceInfos.length; i++) {
        const sourceInfo = sourceInfos[i];
        if (
          sourceInfo.kind === 'videoinput' &&
          sourceInfo.facing === (isFront ? 'front' : 'environment')
        ) {
          videoSourceId = sourceInfo.deviceId;
        }
      }
      mediaDevices
        .getUserMedia({
          audio: true,
          video: {
            mandatory: {
              minWidth: 500,
              minHeight: 300,
              minFrameRate: 30,
            },
            facingMode: isFront ? 'user' : 'environment',
            optional: videoSourceId ? [{sourceId: videoSourceId}] : [],
          },
        })
        .then(stream => {
          // Got stream!
          joinRoom(stream);
        })
        .catch(error => {
          // Log error
          console.log(error);
        });
    });
  }, [joinRoom]);

  useEffect(() => {
    getStream();
  }, [getStream]);

  return (
    <>
      {console.log(video.streams)}
      <View style={{flex: 1, justifyContent: 'flex-start', padding: 10}}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            height: SCREEN_HEIGHT * 0.5,
            borderColor: 'yellow',
            borderWidth: 4,
          }}>
          {video?.myStream ? (
            <RTCView
              style={{width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.4}}
              streamURL={video?.myStream.toURL()}
            />
          ) : null}
        </View>
        <View style={{flex: 1, backgroundColor: 'black'}}>
          <ScrollView horizontal style={{padding: 10}}>
            <>
              {video.streams.length > 0 ? (
                <>
                  {console.log(video.streams.length)}
                  {video.streams.map((stream, index) => (
                    <View
                      key={index}
                      style={{
                        width: 200,
                        backgroundColor: 'red',
                        borderWidth: 1,
                        borderColor: '#fff',
                        marginRight: 10,
                        padding: 5,
                      }}>
                      <RTCView
                        style={{
                          width: 180,
                          height: SCREEN_HEIGHT * 0.4,
                        }}
                        streamURL={stream.toURL()}
                      />
                    </View>
                  ))}
                </>
              ) : null}
            </>
            {video.remoteStreams.length > 0
              ? video.remoteStreams.map((stream, index) => (
                  <View
                    key={index}
                    style={{
                      width: 200,
                      backgroundColor: 'blue',
                      borderWidth: 1,
                      borderColor: '#fff',
                      marginRight: 10,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <RTCView
                      style={{
                        width: 180,
                        height: SCREEN_HEIGHT * 0.4,
                      }}
                      streamURL={stream.toURL()}
                    />
                  </View>
                ))
              : null}
          </ScrollView>
        </View>
      </View>
    </>
  );
};

const mapStateToProps = ({video}) => ({
  video,
});

export default connect(mapStateToProps, {joinRoom})(App);
