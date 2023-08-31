import { clients } from '../websockets'

const getCameraList = () => {

  let viewers = [] as string[]

  for(const [client, clientData] of clients()) {
    if(clientData.type === 'camera') {
      viewers.push(client)
    }
  }

  return viewers

}

export default {
  getCameraList
}