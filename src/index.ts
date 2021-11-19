import http from 'http'
import express, { NextFunction, Request, Response } from 'express'
import { CreateFalcorRouter } from './falcor'
import { falcorMiddleware } from './utils'


const app = express()
  .use('/model.json', falcorMiddleware(CreateFalcorRouter))
  .use((err: any, _: Request, res: Response, _next: NextFunction) => {
    console.error(err)

    if (err.code && err.message) {
      return res
        .status(err.code)
        .end(err.message)
    }

    res
      .status(500)
      .end('Server Error')
  })


http.createServer(app).listen(3000, () => {
  console.log('listening on 3000')
})
