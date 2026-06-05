import axios from "axios"
import dayjs from "dayjs"

class CashService {

    // этот метод сделаю привтаым буду исопльзовать только внутри этого класа в методах
    private async getResidenceToken() {
        try {
            const response = await axios.post('https://residence.hbnetwork.ru/api/login', {
                login: "3000@mail.ru",
                password: "3000"
            })
            const token: string = response.data.data.token
            
            return token
        } catch (e: unknown) {
            console.log(e)
            return null
        }
    }

    public async getResidenceLeads(query: {gte: string, lte: string}) {
        try {

            const gte: string = query.gte
            const lte: string = query.lte

            const token: string | null = await this.getResidenceToken()

            if (typeof(token) == null) {
                return 'ошибка получения токена'
            }

            const response = await axios.get('https://residence.hbnetwork.ru/api/leads', {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    startedAt: [
                        'gte:' + dayjs(gte).format('YYYY-MM-DD'),
                        'lte:' + dayjs(lte).format('YYYY-MM-DD')
                    ],
                    _select: 'status phone startedAt price',
                    _limit: 0
                }
            })

            const holdStatus: string[] = ['hold', 'confirmed', 'refused']
            
            const leadsArray: {
                status: string, 
                phone: string, 
                startedAt: any, 
                price: {
                    paid: number, 
                    offer: number,
                    salary: number
                }
            }[] = response.data.data

            let aggregatedDataObject: {[key: string]: any} = {}

            let aggregatedDataArray: {
                date: string, 
                countLead: number, 
                countHold: number, 
                sumHold: number, 
                // brokerSalary: number, 
                // bonuses: number,
                cash: number
            }[] = []

            leadsArray.forEach((lead) => {

                lead.startedAt = dayjs(lead.startedAt).format('YYYY-MM-DD')

                if (aggregatedDataObject[lead.startedAt]) {
                    aggregatedDataObject[lead.startedAt].countLead += 1
                    aggregatedDataObject[lead.startedAt].countHold += holdStatus.includes(lead.status) ? 1 : 0
                    aggregatedDataObject[lead.startedAt].sumHold += holdStatus.includes(lead.status) ? lead?.price?.offer : 0
                    aggregatedDataObject[lead.startedAt].cash += holdStatus.includes(lead.status) ? lead?.price?.offer * 0.6 : 0
                } else {
                    aggregatedDataObject[lead.startedAt] = {
                        date: lead.startedAt,
                        countLead: 1,
                        countHold: holdStatus.includes(lead.status) ? 1 : 0,
                        sumHold: holdStatus.includes(lead.status) ? lead?.price?.offer : 0,
                        cash: holdStatus.includes(lead.status) ? lead?.price?.offer * 0.6 : 0
                    }
                }
            })

            aggregatedDataArray = Object.values(aggregatedDataObject)

            return aggregatedDataArray
        } catch (e: unknown) {
            console.log(e)
            return []
        }
    }

}

const cashServiceInstance = new CashService()

export default cashServiceInstance