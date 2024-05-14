import * as ejs from 'ejs'
import * as express from 'express'
import * as fs from 'fs'
import * as logger from './logger'

// 配置文件读取
const config = JSON.parse(fs.readFileSync('config.json').toString())
logger.init(config) // 初始化日志模块

const timeStarted = new Date().toString()

logger.info(`Starting Oni Server...`, "express")
const app = express()
const port: Number = config.port // 运行端口
try {
    app.listen(port, () => {
        logger.info(`Oni Server started on port ${port} `, "express")
        logger.info("繚乱、狂乱、力尽きたら来世までごきげんよう。","Oni")
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
            res.set('Content-Type', 'application/javascript');
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

var userList = JSON.parse(fs.readFileSync("data/userList.json").toString())
var botList = JSON.parse(fs.readFileSync("data/botList.json").toString())

// RtData: 最简单的数据存储，用于存储实时的数据，不会被保存
// Type 0: 当前量
// Type 1: 当前量 + 总量 + EU 输入 + EU 输出
var RtData = JSON.parse(fs.readFileSync("data/RtData/RtData.json").toString())

// AeCpusData: 存储 AE 系统的 CPU 状态信息，不会被保存
var AeCpusData: any

function checkUserToken(token: string) {
    let user = userList.find((user: { token: string }) => user.token == token)
    if (user != undefined) { return user } else { return false }
}

function checkBotToken(token: string) {
    let bot = botList.find((bot: { token: string }) => bot.token == token)
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
        data: botList
    }
    res.json(_)
})

// WEB: 获取 RtData
app.get('/api/web/getRtData', (req: any, res: any) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    if (!checkUserToken(req.query.token)) { res.json(returnDataTokenCheckFailed) }

    let success = true
    let code = 0
    let data = RtData.find((data: { name: string }) => data.name == req.query.name)
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
    let data = AeCpusData
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

// OC: 写入 RtData
app.put('/api/oc/putRtData', (req: any, res: any) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    if (!checkBotToken(req.query.token)) { res.json(returnDataTokenCheckFailed) }

    let success = true
    let code = 0
    let data = RtData.find((data: { name: string }) => data.name == req.query.name)
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
    AeCpusData = JSON.parse(req.query.data)
    if (AeCpusData == undefined) { success = false; code = 2 }
    let data = AeCpusData

    const _ = {
        success: success,
        code: code,
        data: data
    }

    res.json(_)
})

// Oni API END //




