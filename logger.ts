function getTimeString() {
    let str: string = ""
    let date = new Date()

    if (tzp8Tf) {
        date.setHours(date.getHours() + 8)
    }

    if (date.getHours() < 10) { str += "0" }
    str += date.getHours().toString()
    str += ":"
    if (date.getMinutes() < 10) { str += "0" }
    str += date.getMinutes().toString()
    str += ":"
    if (date.getSeconds() < 10) { str += "0" }
    str += date.getSeconds().toString()

    return str
}

function getTimeStringWithDate() {
    let str: string = ""
    let date = new Date()

    if (tzp8Tf) {
        date.setHours(date.getHours() + 8)
    }

    str += `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} `
    // Why Month+1 ??
    str += getTimeString()
    return str
}

interface Log {
    time: string
    type: string
    part: string
    text: string
}

export var publicLogStack: Log[] = []
function publicLogStackAdd(time: string, type: string, part: string, text: string) {
    publicLogStack.push({ time: time, type: type, part: part, text: text })
    if (publicLogStack.length > 50) { publicLogStack.shift() }
}

var debuglogTf: boolean
var tzp8Tf: boolean
var logStackMaxNum: number

export function init(config: any) {
    debuglogTf = config.debuglog
    tzp8Tf = config.tzp8
    logStackMaxNum = config.logStackMax
}

export function debug(t: any, p: string) {
    if (debuglogTf) {
        console.log(`[${getTimeString()}] [${p}/DEBUG]: ${t}`)
        publicLogStackAdd(getTimeStringWithDate(), "debug", p, t)
    }
}
export function info(t: any, p: string) {
    console.log(`[${getTimeString()}] [${p}/INFO]: ${t}`)
    publicLogStackAdd(getTimeStringWithDate(), "info", p, t)
}
export function warn(t: any, p: string) {
    console.log(`[${getTimeString()}] [${p}/WARN]: ${t}`)
    publicLogStackAdd(getTimeStringWithDate(), "warn", p, t)
}
export function error(t: any, p: string) {
    if (t instanceof Error) {
        console.log(`[${getTimeString()}] [${p}/ERROR]:`)
        console.log(t)
    } else {
        console.log(`[${getTimeString()}] [${p}/ERROR]: ${t}`)
    }
    publicLogStackAdd(getTimeStringWithDate(), "error", p, `${t.stack}`)
}