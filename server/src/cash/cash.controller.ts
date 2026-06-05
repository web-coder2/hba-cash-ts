import axios from "axios"
import dayjs from "dayjs"

import cashServiceInstance from "./cash.service"

class CashController {

    public async getCashTable(query: {gte: string, lte: string}) {
        try {
            const tabledata = await cashServiceInstance.getResidenceLeads(query)
            return tabledata
        } catch (e: any) {
            console.log(e.message)
            return null
        }
    }

}

const cashControllerInstance = new CashController()

export default cashControllerInstance