let connectionList = [],
  media = null,
  ws = null

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