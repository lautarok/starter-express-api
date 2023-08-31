import { NextFunction, Request, Response } from 'express'

export default function viewsEngine(
  req: Request,
  res: Response,
  next: NextFunction
) {

  if(
    req.path.split('/')[1] === 'v1'
    || req.path.split('/')[1] === 'static'
  ) {
    return next()
  }

  switch (req.path) {

    case '/camera':
      return res.render('camera')

    default:
      return res.render('index')

  }

}
