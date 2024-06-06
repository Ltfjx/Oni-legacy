import * as fs from 'fs'
import * as utils from './utils'
import * as logger from './logger'

export class global {

    // userList: 用户数据
    public static userList: any[]

    // botList: Bot数据
    public static botList: any[]

    // RtData: 最简单的数据存储，用于存储实时的数据，不会被保存
    // Type 0: 当前量
    // Type 1: 当前量 + 总量 + EU 输入 + EU 输出
    public static rtData: any[]

    // AeCpusData: 存储 AE 系统的 CPU 状态信息，不会被保存
    public static aeCpusData: any = []
    public static aeCpusDataLast: any = undefined

    // eventList: 存储当前事件列表
    public static eventList: any = []

    static eventMax: number

    // init: 初始化全局变量
    static init(config: any) {
        global.userList = JSON.parse(fs.readFileSync("data/userList.json").toString())
        global.botList = JSON.parse(fs.readFileSync("data/botList.json").toString())
        global.rtData = JSON.parse(fs.readFileSync("data/RtData/RtData.json").toString())
        global.eventMax = config.eventMax
        logger.info("全局数据初始化完成", "global")
    }

    // 将事件推送到 EventList
    // uuid: 事件的 uuid
    // name: 事件名称（内部使用，英文简写即可，如 maintenance）
    // message: 事件标题（展示给用户，提供可读的信息，如 维护问题）
    // target: 事件发生的目标（如 超净间）
    // location: 事件位置
    // priority: 事件等级 (0=通知 1=警告 2=紧急)
    // status: 事件状态 (0=未解决 1=用户标记为已解决)
    // timeStamp: 事件推送的时间
    static eventPush(name: string, message: string, target: string, location: string, priority: number) {
        if ([name, message, target, location, priority].some(p => p == undefined)) { return false }
        else {
            if (!global.eventList.some((e: any) => e.name == name && e.target == target && e.location == location && e.status != 1)) {
                global.eventList.push(
                    {
                        "uuid": utils.uuid(),
                        "name": name,
                        "message": message,
                        "target": target,
                        "location": location,
                        "priority": priority,
                        "status": "0",
                        "timeStamp": new Date().getTime()
                    }
                )
            }
            if (global.eventList.length > global.eventMax) { global.eventList.shift() }
            return true
        }
    }
}



