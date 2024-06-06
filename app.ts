import * as express from 'express'
import * as fs from 'fs'
import * as logger from './logger'
import { global } from './global'
import * as prober from './prober'

// 配置文件读取
const config = JSON.parse(fs.readFileSync('config.json').toString())
logger.init(config)
global.init(config)
prober.init(config)

const timeStarted = new Date().toString()

logger.info(`Starting Oni Server...`, "express")
const app = express.default()
try {
    app.listen(config.port, () => {
        logger.info(`Oni Server started on port ${config.port} `, "express")
        logger.info("繚乱、狂乱、力尽きたら来世までごきげんよう。", "Oni")
    })
} catch (e) {
    logger.error(e, "express")
}


app.use('/node_modules', express.static('node_modules'))
app.use('/js', express.static('js'))
app.use('/css', express.static('css'))
app.set('view engine', 'ejs')

app.use('/js', express.static('js', {
    setHeaders: (res: any, path: any, stat: any) => {
        if (path.endsWith('.js')) {
            res.set('Content-Type', 'application/javascript')
        }
    }
}))

// 主页
app.get('/', (req: any, res: any) => {
    try {
        res.render(`index.ejs`)
    } catch (e) {
        logger.error(e, "ejsRenderer")
    }
})

// Oni API START //


// 用户 Token 校验
function checkUserToken(token: string) {
    let user = global.userList.find((user: { token: string }) => user.token == token)
    if (user != undefined) { return user } else { return false }
}

// Bot Token 校验
function checkBotToken(token: string) {
    let bot = global.botList.find((bot: { token: string }) => bot.token == token)
    if (bot != undefined) {
        bot.lastseen = new Date().getTime()
        return bot
    } else {
        return false
    }
}

const returnDataTokenCheckFailed = { success: false, code: 1 }

// [公开] Ping
app.get('/api/ping', (req: any, res: any) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    const _ = {
        success: true,
        code: 0,
        data: 'pong!'
    }
    res.json(_)
})

// WEB: 获取服务启动时间
app.get('/api/web/getTimeStarted', (req: any, res: any) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    if (!checkUserToken(req.query.token)) { res.json(returnDataTokenCheckFailed) }
    const _ = {
        success: true,
        code: 0,
        data: timeStarted
    }
    res.json(_)
})

// WEB: 获取用户信息
app.get('/api/web/getUserData', (req: any, res: any) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    let user = checkUserToken(req.query.token)
    if (!user) { res.json(returnDataTokenCheckFailed) }
    const _ = {
        success: true,
        code: 0,
        data: user
    }
    res.json(_)
})

// WEB: 获取 Bot 列表
app.get('/api/web/getBotList', (req: any, res: any) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    if (!checkUserToken(req.query.token)) { res.json(returnDataTokenCheckFailed) }
    const _ = {
        success: true,
        code: 0,
        data: global.botList
    }
    res.json(_)
})

// WEB: 获取 RtData
app.get('/api/web/getRtData', (req: any, res: any) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    if (!checkUserToken(req.query.token)) { res.json(returnDataTokenCheckFailed) }

    let success = true
    let code = 0
    let data = global.rtData.find((data: { name: string }) => data.name == req.query.name)
    if (data == undefined) { success = false; code = 2 }

    const _ = {
        success: success,
        code: code,
        data: data
    }
    res.json(_)
})

// WEB: 获取 AeCpusData
app.get('/api/web/getAeCpusData', (req: any, res: any) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    if (!checkUserToken(req.query.token)) { res.json(returnDataTokenCheckFailed) }

    let success = true
    let code = 0
    let data = global.aeCpusData
    if (data == undefined) { success = false; code = 2 }

    const _ = {
        success: success,
        code: code,
        data: data
    }
    res.json(_)
})

// WEB: 获取 MC 服务器状态
app.get('/api/web/getMcServerStatus', (req: any, res: any) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    if (!checkUserToken(req.query.token)) { res.json(returnDataTokenCheckFailed) }

    let success = true
    let code = 0
    let data = mcServerStatus
    if (data == undefined) { success = false; code = 2 }

    const _ = {
        success: success,
        code: code,
        data: data
    }
    res.json(_)
})

// WEB: 获取服务端日志
app.get('/api/web/getServerLog', (req: any, res: any) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    if (!checkUserToken(req.query.token)) { res.json(returnDataTokenCheckFailed) }
    const _ = {
        success: true,
        code: 0,
        data: logger.publicLogStack
    }
    res.json(_)
})

// WEB: 获取事件列表
app.get('/api/web/getEventList', (req: any, res: any) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    if (!checkUserToken(req.query.token)) { res.json(returnDataTokenCheckFailed) }
    const _ = {
        success: true,
        code: 0,
        data: global.eventList
    }
    res.json(_)
})

// WEB: 修改事件状态
app.put('/api/web/putEventStatus', (req: any, res: any) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    if (!checkUserToken(req.query.token)) { res.json(returnDataTokenCheckFailed) }

    const itemToUpdate = global.eventList.find((e: any) => e.uuid === req.query.uuid)
    if (itemToUpdate) {
        itemToUpdate.status = req.query.status
    }
    const _ = {
        success: true,
        code: 0,
        data: global.eventList
    }
    res.json(_)
})

// WEB: 获取统计数据
app.get('/api/web/getProberData', (req: any, res: any) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    if (!checkUserToken(req.query.token)) { res.json(returnDataTokenCheckFailed) }
    const _ = {
        success: true,
        code: 0,
        data: prober.getData(req.query.part, req.query.name, req.query.range)
    }
    res.json(_)
})

// OC: 写入 RtData
app.put('/api/oc/putRtData', (req: any, res: any) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    if (!checkBotToken(req.query.token)) { res.json(returnDataTokenCheckFailed) }

    let success = true
    let code = 0
    let data = global.rtData.find((data: { name: string }) => data.name == req.query.name)
    if (data == undefined) { success = false; code = 2 }
    else {
        if (data.type == 0) {
            data.value = req.query.value
        } else if (data.type == 1) {
            data.value = req.query.value
            data.max = req.query.max
            data.euio = req.query.euio
        }
    }

    const _ = {
        success: success,
        code: code,
        data: data
    }
    res.json(_)
})

// OC: 写入 AeCpusData
app.put('/api/oc/putAeCpusData', (req: any, res: any) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    if (!checkBotToken(req.query.token)) { res.json(returnDataTokenCheckFailed) }

    let success = true
    let code = 0
    const raw = JSON.parse(req.query.data)

    if (global.aeCpusDataLast) {
        if (raw.length == global.aeCpusDataLast.length) {
            global.aeCpusDataLast.forEach((cpu: any) => {
                let cpuRaw = raw.find((c: any) => c.name == cpu.name)
                let cpuNew = global.aeCpusData.find((c: any) => c.name == cpu.name)

                if (!cpu.busy && cpuRaw.busy) {
                    cpuNew.timeStarted = new Date().getTime()
                    cpuNew.finalOutputTotal = cpuRaw.finalOutputLeft
                    cpuNew.finalOutputLeft = cpuRaw.finalOutputLeft
                    cpuNew.finalOutputLabel = cpuRaw.finalOutputLabel
                    cpuNew.busy = cpuRaw.busy
                } else if (cpu.busy && cpuRaw.busy) {
                    if (cpuNew.finalOutputTotal == undefined) { cpuNew.finalOutputTotal = cpuRaw.finalOutputLeft }
                    cpuNew.finalOutputLeft = cpuRaw.finalOutputLeft
                } else if (cpu.busy && !cpuRaw.busy) {
                    cpuNew.timeStarted = undefined
                    cpuNew.finalOutputTotal = undefined
                    cpuNew.finalOutputLeft = undefined
                    cpuNew.finalOutputLabel = undefined
                    cpuNew.busy = cpuRaw.busy
                }
            })
        } else { // 如果 cpu 数量发生变化，则重新构建
            global.aeCpusDataLast = undefined
        }

    } else {
        global.aeCpusData = raw
        global.aeCpusDataLast = raw
    }


    if (global.aeCpusData == undefined) { success = false; code = 2 }
    let data = global.aeCpusData

    const _ = {
        success: success,
        code: code,
        data: data
    }

    res.json(_)
})

// OC: 写入事件
app.post('/api/oc/postEvent', (req: any, res: any) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    if (!checkBotToken(req.query.token)) { res.json(returnDataTokenCheckFailed) }

    let success = true
    let code = 0
    if (!global.eventPush(req.query.name, req.query.message, req.query.target, req.query.location, req.query.priority)) {
        success = false
        code = 3
    }

    const _ = {
        success: success,
        code: code,
        data: global.eventList
    }

    res.json(_)
})



// Oni API END //

// Oni 定时任务 START //

var mcServerStatus: any = {
    "ip": config.serverIP,
    "online": false,
    "motd": "",
    "players": {
        "max": -1,
        "online": 0,
        "list": []
    }

}

setInterval(() => {
    mcServerStatusUpdate()
}, 60000)

mcServerStatusUpdate()
async function mcServerStatusUpdate() {
    try {
        const mc = await import('minecraftstatuspinger').then(mc => mc.default)
        const result = await mc.lookup({ host: mcServerStatus.ip })

        const data = result.status

        if (data != null) {
            mcServerStatus.online = true
            mcServerStatus.players.max = data.players.max
            mcServerStatus.players.online = data.players.online
            mcServerStatus.players.list = data.players.sample
            mcServerStatus.motd = data.description
        } else {
            mcServerStatus.online = false
        }


    } catch (error) {
        logger.error(error, "mcServerStatus")
        mcServerStatus.online = false
    }
}
// Oni 定时任务 END //