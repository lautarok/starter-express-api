import express from 'express'
import config from './config'
import cors from 'cors'
import bodyParser from 'body-parser'
import v1Router from './routes/v1'
import viewsEngine from './routes/views'
import { initWSS } from './websockets'

initWSS()

const app = express()

app.use(cors())
app.use(bodyParser.json())
app.set('view engine', 'pug')
app.set('views', 'src/views')

// Views
app.use(viewsEngine)

// Routes
app.use('/v1', v1Router)

// Serve static files
app.use('/static', express.static('src/static'))

app.listen(config.HTTP_PORT, () => {
  console.log(`App listening on port ${config.HTTP_PORT}`)
})