import { Request, Response, Router } from "express"
import dayjs from "dayjs"
import axios from "axios"


class CashRouter {

    public router: Router

    constructor() {
        this.router = Router()
        this.init()
    }

    init() {
        this.router.get('/', this.getHBACash)
    }

    private getHBACash(req: Request, res: Response) {
        try {
            const data: number[] = [10, 20, 30]
            res.status(200).json({ data: data })
        } catch (e: any) {
            console.log(e.message)
            res.status(500).json({ err: e.message })
        }
    }

}

const cashRouterInstance = new CashRouter()

export default cashRouterInstance