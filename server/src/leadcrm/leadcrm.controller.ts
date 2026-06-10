import axios from "axios"
import dayjs from "dayjs"

import leadcrmServiceInstance from "./leadcrm.service"

class LeadcrmController {

    public async getLeadcrmSalary(query: {gte: string, lte: string}) {
        try {
            const data = leadcrmServiceInstance.getLeadsSalary(query)
            return data
        } catch (e: unknown) {
            console.log(e)
            return null
        }
    }

}

const leadcrmControllerInstance = new LeadcrmController()

export default leadcrmControllerInstance