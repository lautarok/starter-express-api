let connectionList = [],
  media = null,
  ws = null,
  ws2 = null

  const getConnection = (uuid) => connectionList
  .find(connection => connection.uuid === uuid)

const startMedia = async () => {

  media = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: 'environment',
      width: 300,
      height: 300
    },
    audio: true
  })

  const videoElement = document.createElement('video')

  videoElement.autoplay = true
  videoElement.muted = true
  videoElement.srcObject = media

  document.body.append(videoElement)

}

const receiveOffer = async data => {

  const connection = new RTCPeerConnection({
    iceServers: [
      {
        urls: 'stun:stun.l.google.com:19302'
      },
      {
        urls: 'turn:numb.viagenie.ca',
        credential: 'muazkh',
        username: 'webrtc@live.com'
      }
    ]
  })

  connection.onicecandidate = event => {

    if(event.candidate) {
      ws.send(JSON.stringify({
        to: data.from,
        candidate: event.candidate
      }))
    }

  }

  media.getTracks().forEach(track => {
    if(track.enabled) connection.addTrack(track, media)
  })

  connection.setRemoteDescription(data.offer)

  connectionList.push({
    uuid: data.from,
    connection
  })

  const answer = await connection.createAnswer()

  connection.setLocalDescription(answer)

  ws.send(JSON.stringify({
    to: data.from,
    answer
  }))

}

const receiveIceCandidate = data => {
  getConnection(data.from).connection.addIceCandidate(data.candidate)
}

const startWebsockets = url => {

  ws = new WebSocket(url)

  ws.onopen = () => {

    ws.send(JSON.stringify({
      register: 'camera'
    }))

  }

  ws.onmessage = event => {

    const data = JSON.parse(event.data)

    if(data.offer) {
      receiveOffer(data)
    } else if(data.candidate) {
      receiveIceCandidate(data)
    }

  }

}

const initCamera = async (ws_url = 'ws://192.168.0.110:33303') => {
  await startMedia()
  startWebsockets(ws_url)
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const sleep2 = (ms, callback) => {
  setTimeout(callback, ms)
}

const receiveAnswer = async data => {
  getConnection(data.from).connection.setRemoteDescription(data.answer)
}

const initWebsockets = url => new Promise(resolve => {

  ws2 = new WebSocket(url)

  ws2.onopen = () => {

    ws2.send(JSON.stringify({
      register: 'viewer'
    }))

    resolve()

  }

  ws2.onmessage = event => {

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

const initMulti = async () => {
  await initCamera()
  await initViewer()
}