import express, { Express } from "express"
import bodyParser from "body-parser"
import axios from "axios"
import dayjs from "dayjs"
import cors from "cors"

import cashRouterInstance from "./cash/cash.route"

const server: Express = express()
const port: number = 3000

server.use(bodyParser.json())
server.use(cors({ origin: '*' }))


server.use('/api/hba-cash', cashRouterInstance.router)

server.listen(port, () => {
    console.log(`server has been running on http://localhost:${port}`)
})