import * as logger from './logger'
import fs from 'fs'
import path from 'path'
import { global } from './global'

export function init(config: any) {
    setInterval(() => {
        saveData("rtData", "battery", global.rtData.find(data => data.name == "battery").value)
    }, 60000)
    logger.info("数据探针初始化完成", "prober")
}

// range: 读取的数据范围，以天为单位。出于性能考虑，建议使用7天以下的值。
export function getData(part: string, name: string, range: any) {
    let _ = ""
    for (let i = parseInt(range) + 1; i > 0; i--) {
        const filePath = path.join(process.cwd(), "data", "prober", part, name, getDate(-i + 1) + ".txt")
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath).toString()
            _ += data
        }
    }
    return _
}

// offset：偏移量（天）
function getDate(offset?: number) {
    let t = new Date()
    if (offset) { t.setDate(t.getDate() + offset) }
    const year = t.getFullYear()
    const month = (t.getMonth() + 1).toString().padStart(2, '0')
    const day = t.getDate().toString().padStart(2, '0')
    const _ = year + month + day
    return _
}

function saveData(part: string, name: string, data: any) {
    let t = new Date()
    const filePath = path.join(process.cwd(), "data", "prober", part, name, getDate() + ".txt")
    const fileData = Math.floor(t.getTime() / 1000) + "|" + data.toString() + ";"
    fs.appendFile(filePath, fileData, (err) => {
        if (err) {
            logger.error(err, "prober")
        } else {
            logger.debug(`Data of ${part}/${name} saved to ${getDate() + ".txt"}`, "prober")
        }
    })
}