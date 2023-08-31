let connectionList = [],
  ws = null

const getConnection = (uuid) => connectionList
  .find(connection => connection.uuid === uuid)

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const receiveAnswer = async data => {
  getConnection(data.from).connection.setRemoteDescription(data.answer)
}

const receiveIceCandidate = async data => {
  getConnection(data.from).connection.addIceCandidate(data.candidate)
}

const initWebsockets = url => new Promise(resolve => {

  ws = new WebSocket(url)

  ws.onopen = () => {

    ws.send(JSON.stringify({
      register: 'viewer'
    }))

    resolve()

  }

  ws.onmessage = event => {

    const data = JSON.parse(event.data)

    if(data.answer) {
      receiveAnswer(data)
    } else if(data.candidate) {
      receiveIceCandidate(data)
    }

  }

})

const emitOffer = async (camera) => {

  const connection = new RTCPeerConnection({
    iceServers: [
      {
        urls: 'stun:stun.l.google.com:19302'
      },
      {
        urls: 'stun:stun1.l.google.com:19302'
      },
      {
        urls: 'stun:stun2.l.google.com:19302'
      },
      {
        urls: 'stun:stun3.l.google.com:19302'
      },
      {
        urls: 'turn:numb.viagenie.ca',
        credential: 'muazkh',
        username: 'webrtc@live.com'
      }
    ]
  })
    
  const videoElement = document.createElement('video')
  videoElement.autoplay = true
  document.body.appendChild(videoElement)

  connection.ontrack = event => {
    videoElement.srcObject = event.streams[0]
  }

  connection.onicecandidate = event => {

    if(event.candidate) {
      ws.send(JSON.stringify({
        to: camera,
        candidate: event.candidate
      }))
    }

  }

  connectionList.push({
    uuid: camera,
    connection
  })

  const offer = await connection.createOffer({
    offerToReceiveVideo: true,
    offerToReceiveAudio: true
  })

  await connection.setLocalDescription(offer)

  ws.send(JSON.stringify({
    offer,
    to: camera
  }))

}

const fetchCameras = async () => {

  const fullResponse = await fetch('/v1/cameras'),
    response = await fullResponse.json()

  response.list.forEach(camera => {

    if(!getConnection(camera)) {

      emitOffer(camera)

    }

  })

  await sleep(3000)
  fetchCameras()

}

const initViewer = async (ws_url = 'ws://192.168.0.110:33303') => {
  await initWebsockets(ws_url)
  fetchCameras()
}