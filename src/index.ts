import express from 'express'
import dotenv from 'dotenv'
import bodyParser from 'body-parser'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import * as dynamoose from 'dynamoose'
import e from 'express'

/* ROUTE IMPORTS */
import courseRoutes from './routes/courseRoutes'

/* CONFIGURATIONS */
dotenv.config()

const isProduction = process.env.NODE_ENV === 'production'

if (!isProduction) {
  dynamoose.aws.ddb.local()
}

const app = express()
app.use(express.json())
app.use(helmet())
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }))
app.use(morgan('common'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors())

/* ROUTES */

app.get('/', (req, res) => {
  res.send('Welcome to the server!')
})

app.use('/courses', courseRoutes)

app.use((err: any, req: e.Request, res: e.Response, next: e.NextFunction) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

/* Server */
const PORT = process.env.PORT || 3000
if (!isProduction) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
  })
} else {
  console.log(`Server is running in production mode on port ${PORT}`)
}
export default app
