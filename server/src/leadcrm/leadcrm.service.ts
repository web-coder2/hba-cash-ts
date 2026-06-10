import axios from "axios"
import dayjs from "dayjs"

type leadorubStat = {
    name: string,
    email: string,
    countLeads: number,
    countHolds: number,
    countCalls: number,
    salary: number,
    clear: number
}

interface IleadSalaryReq {
    gte: string,
    lte: string
}

interface IleadSalaryData {
    users: leadorubStat[]
}

interface IleadSalaryError {
    message: string | unknown
}

class LeadcrmService {

    public async getLeadsSalary(query: IleadSalaryReq): Promise <IleadSalaryData | IleadSalaryError> {
        try {
            const response = await axios.get('http://31.130.151.240:3000/api/salary/get', {
                params: {
                    gte: query.gte,
                    lte: query.lte
                }
            })

            const data: IleadSalaryData = {
                users: []
            }

            response.data.data.forEach((user: leadorubStat) => {
                data.users.push({
                    name: user.name,
                    email: user.email,
                    countLeads: user.countLeads,
                    countHolds: user.countHolds,
                    countCalls: user.countCalls,
                    salary: user.salary,
                    clear: user.clear
                })
            })

            return data
        } catch (e: unknown) {
            console.log(e)
            const errorObj: IleadSalaryError = { message: e }
            return errorObj
        }
    }

}

const leadcrmServiceInstance = new LeadcrmService()

export default leadcrmServiceInstance