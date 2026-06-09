import axios from "axios"
import dayjs from "dayjs"

import cashServiceInstance from "./cash.service"

class CashController {

    public async getCashTable(query: {gte: string, lte: string}) {
        try {
            const tabledata = await cashServiceInstance.getResidenceLeads(query)
            return tabledata
        } catch (e: unknown) {
            console.log(e)
            return null
        }
    }

    public async getBrokersStats(query: {gte: string, lte: string}) {
        try {
            const brokersData = await cashServiceInstance.getBrokersStats(query)
            return brokersData
        } catch (e: unknown) {
            console.log(e)
            return null
        }
    }

}

const cashControllerInstance = new CashController()

export default cashControllerInstance