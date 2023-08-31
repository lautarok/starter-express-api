import express from 'express'
import clients from '../modules/clients'

const router = express.Router()

router.get('/health', (req, res) => {
  res.send('Alive!')
})

router.get('/cameras', clients.cameraList)

export default router