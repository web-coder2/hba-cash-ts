import { Request, Response, Router } from "express"
import dayjs from "dayjs"
import axios from "axios"

import cashControllerInstance from "./cash.controller"

class CashRouter {

    public router: Router

    constructor() {
        this.router = Router()
        this.init()
    }

    init() {
        this.router.get('/', this.getHBACash)
    }

    async getHBACash(req: {query: {gte: string, lte: string}}, res: string | any) {
        try {
            const data = await cashControllerInstance.getCashTable(req.query)
            res.status(200).json({ data: data })
        } catch (e: any) {
            console.log(e.message)
            res.status(500).json({ err: e.message })
        }
    }

}

const cashRouterInstance = new CashRouter()

export default cashRouterInstance