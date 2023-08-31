import { Request, Response } from 'express'
import controller from '../controllers/clients'


const cameraList = (req: Request, res: Response) => {

  res.json({
    list: controller.getCameraList()
  })

}

export default { cameraList }