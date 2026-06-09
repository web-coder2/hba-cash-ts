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

    private async getBrokersBonuses(gte: string, lte: string, token: string | null): Promise<number | null> {
        try {
            const response = await axios.get("https://residence.hbnetwork.ru/api/leads/salary", {
                params: {
                    '_page': 1,
                    '_limit': 0,
                    'startedAt[]': ['gte:' + dayjs(gte).format('YYYY-MM-DD'), 'lte:' + dayjs(gte).format('YYYY-MM-DD')]
                },
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            return response.data.data.total.total.bonuses
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

            type bonusesDataByDate = {
                datedAt: string,
                bonusValue: number
            }

            type fullBonusesDataType = bonusesDataByDate[]

            const fullBonusesData: fullBonusesDataType = []

            for (let now: string = dayjs(gte).format('YYYY-MM-DD'); now <= dayjs(lte).format('YYYY-MM-DD'); now = dayjs(now).add(1, 'day').format('YYYY-MM-DD')) {
                const brokersBonuseses: number | null = await this.getBrokersBonuses(now, now, token)
                
                if (typeof(brokersBonuseses) === 'number') {

                    let bonusDataDay: bonusesDataByDate = {
                        datedAt: now,
                        bonusValue: brokersBonuseses
                    }

                    fullBonusesData.push(bonusDataDay)
                }                
            }

            console.log(fullBonusesData, '*****')

            const holdStatus: string[] = ['hold', 'confirmed', 'refused']
            
            type leadsArrayType = {
                status: string, 
                phone: string, 
                startedAt: any, 
                price: {
                    paid: number, 
                    offer: number,
                    salary: number
                }
            }[]
            
            const leadsData: leadsArrayType = response.data.data

            let aggregatedDataObject: {[key: string]: any} = {}

            type aggregatedDataArrayType = {
                date: string, 
                countLead: number, 
                countHold: number, 
                sumHold: number, 
                bonuses: number,
                clear: number,
                cash: number,
                brokerSalary: number,

                getSuccess(clear: number): string
            }[]

            let aggregatedDataArray: aggregatedDataArrayType = []

            leadsData.forEach((lead) => {

                lead.startedAt = dayjs(lead.startedAt).format('YYYY-MM-DD')

                let bonusValueByDay: number = fullBonusesData.find((item) => {
                    return item.datedAt === lead.startedAt
                })?.bonusValue || 0

                let countHold: number = holdStatus.includes(lead.status) ? 1 : 0
                let sumHold: number = holdStatus.includes(lead.status) ? lead?.price?.offer : 0
                let brokerSalary: number = holdStatus.includes(lead.status) ? Math.floor(lead?.price?.offer * 0.6 * 0.145) : 0
                let cash: number = holdStatus.includes(lead.status) ? lead?.price?.offer * 0.6 : 0
                let clear: number = Math.floor(cash - brokerSalary - bonusValueByDay)

                if (aggregatedDataObject[lead.startedAt]) {
                    aggregatedDataObject[lead.startedAt].countLead += 1
                    aggregatedDataObject[lead.startedAt].countHold += countHold
                    aggregatedDataObject[lead.startedAt].sumHold += sumHold
                    aggregatedDataObject[lead.startedAt].cash += cash
                    aggregatedDataObject[lead.startedAt].bonuses += bonusValueByDay
                    aggregatedDataObject[lead.startedAt].brokerSalary += brokerSalary
                    aggregatedDataObject[lead.startedAt].clear += clear
                } else {
                    aggregatedDataObject[lead.startedAt] = {
                        date: lead.startedAt,
                        countLead: 1,
                        countHold: countHold,
                        sumHold: sumHold,
                        cash: cash,
                        bonuses: bonusValueByDay,
                        brokerSalary: brokerSalary,
                        clear: clear,

                        getSuccess: (clear: number): string => (
                            clear > 0 ? 'success' : 'danger'
                        )
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

    public async getBrokersStats(query: { gte: string, lte: string }) {
        try {

            const gte: string = query.gte
            const lte: string = query.lte

            const token: string | null = await this.getResidenceToken()

            const response = await axios.get('https://residence.hbnetwork.ru/api/leads', {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    startedAt: [
                        'gte:' + dayjs(gte).format('YYYY-MM-DD'),
                        'lte:' + dayjs(lte).format('YYYY-MM-DD')
                    ],
                    _select: 'status phone startedAt price',
                    _populate: 'userId',
                    _limit: 0
                }
            })

            type usersStatsType = {
                name: string,
                countLeads: number,
                countHolds: number,
                sumHold: number,
                phones: string[]
            }

            let usersStatsObject: {
                [broker: string]: usersStatsType
            } = {}

            type leadsDataModel = {
                startedAt: string,
                status: string,
                userId: {
                    name: string
                },
                price: {
                    offer: number
                }
                phone: string
            }
            
            let usersStatsArr: usersStatsType[] = []

            const holdsStatuses: string[] = ['hold', 'confirmed', 'refused']

            let leadsDataArray: leadsDataModel[] = response.data.data

            leadsDataArray.forEach((lead) => {
                let broker = lead.userId?.name
                let isHold = holdsStatuses.includes(lead.status) ? 1 : 0
                let sumHold = holdsStatuses.includes(lead.status) ? lead.price.offer : 0
                let phone = lead.phone

                if (usersStatsObject[broker]) {
                    usersStatsObject[broker].countLeads += 1
                    usersStatsObject[broker].countHolds += isHold
                    usersStatsObject[broker].sumHold += sumHold
                    usersStatsObject[broker].phones.push(phone)
                } else {
                    usersStatsObject[broker] = {
                        name: broker,
                        countLeads: 1,
                        countHolds: isHold,
                        sumHold: sumHold,
                        phones: [phone]
                    }
                }
            })

            usersStatsArr = Object.values(usersStatsObject)

            return usersStatsArr

        } catch (e: unknown) {
            console.log(e)
            return null
        }
    }

}

const cashServiceInstance = new CashService()

export default cashServiceInstance