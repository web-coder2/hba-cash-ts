import { Request, Response, Router } from "express"
import dayjs from "dayjs"
import axios from "axios"


import leadcrmControllerInstance from "./leadcrm.controller"

class leadcrmRoute {

    public router: Router

    constructor() {
        this.router = Router()
        this.init()
    }

    init() {
        this.router.get('/salary', this.getLeadcrmSalary)
    }

    async getLeadcrmSalary(req: {query: {gte: string, lte: string}}, res: string | any) {
        try {
            const data = await leadcrmControllerInstance.getLeadcrmSalary(req.query)
            res.status(200).json({ data: data })
        } catch (e: unknown) {
            console.log(e)
            res.status(500).json({ err: e })
        }
    }

}

const leadcrmRouteInstance = new leadcrmRoute()

export default leadcrmRouteInstance