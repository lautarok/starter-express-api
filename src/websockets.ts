import { WebSocket, WebSocketServer } from 'ws'
import { randomUUID } from 'crypto'
import config from './config'

type Client = {
  ws: WebSocket,
  type: 'viewer' | 'camera'
}

let clientMap = new Map<string, Client>()

export const initWSS = () => {

  const wss = new WebSocketServer({
    port: config.WSS_PORT
  })

  wss.on('listening', () => {
    console.log(`WS server listening on port ${config.WSS_PORT}`)
  })

  wss.on('connection', (ws) => {

    const uuid = randomUUID()
    
    ws.on('message', (data) => {

      const body = JSON.parse(data.toString())

      if(body.register) {

        clientMap.set(uuid, {
          ws,
          type: body.register
        })

      } else if(body.offer) {

        clientMap.forEach(({ ws }, id) => {
          if(id === body.to) {
            ws.send(JSON.stringify({
              ...body,
              from: uuid
            }))
          }
        })

      } else if(body.answer) {

        clientMap.forEach(({ ws }, id) => {
          if(id === body.to) {
            ws.send(JSON.stringify({
              ...body,
              from: uuid
            }))
          }
        })

      } else if(body.candidate) {

        clientMap.forEach(({ ws }, id) => {
          if(id === body.to) {
            ws.send(JSON.stringify({
              ...body,
              from: uuid
            }))
          }
        })

      }

    })

    ws.on('close', () => {
      clientMap.delete(uuid)
    })

  })

}

export const clients = () => clientMap