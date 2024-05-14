


// 深色模式
!(function () {
    const darkMode = localStorage.getItem('darkMode')
    if (darkMode === 'true' || (darkMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.getElementById("buttonDarkMode").icon = "light_mode"
        mdui.setTheme("dark")
    }
})()

document.getElementById("buttonDarkMode").addEventListener("click", () => {

    if (mdui.getTheme() == "light") {
        document.getElementById("buttonDarkMode").icon = "light_mode"
        localStorage.setItem('darkMode', 'true')
        mdui.setTheme("dark")
    } else {
        document.getElementById("buttonDarkMode").icon = "dark_mode"
        localStorage.setItem('darkMode', 'false')
        mdui.setTheme("light")
    }
})

// Slogan
!(function () {
    function isMobileDevice() {
        const ua = navigator.userAgent.toLowerCase()
        const kw = ['iphone', 'ipod', 'android', 'windows phone', 'blackberry', 'mobile']
        return kw.some(keyword => ua.includes(keyword))
    }
    if (!isMobileDevice()) {
        const slogan = ["豆！豆！痛いよ！", "人間！妖怪！誰でも歓迎！"]
        let elem = document.getElementById("slogan")
        elem.innerText = `"${slogan[Math.floor(Math.random() * slogan.length)]}"`
    }

})()

// 配色自定义系统
!(function () {
    let colorPicker = document.getElementById("colorPicker")
    let color = localStorage.getItem("customColor")
    if (color != undefined) {
        mdui.setColorScheme(color)
    }
    colorPicker.addEventListener('input', function () {
        mdui.setColorScheme(colorPicker.value)
        localStorage.setItem("customColor", colorPicker.value)
    })
    document.getElementById("buttonColor").addEventListener("click", () => {
        colorPicker.click()
    })
})()


// 导轨
!(function () {
    let railItems = ["overview", "stats", "ae", "bot", "debug"]
    function hideAll() {
        railItems.forEach(item => {
            document.getElementById(`${item}-content`).setAttribute("hidden", "true")
        })
    }
    railItems.forEach(item => {
        document.getElementById(`rail-${item}`).addEventListener("click", () => {
            hideAll()
            document.getElementById(`${item}-content`).removeAttribute("hidden")
        })
    })
    document.getElementById(`rail-${railItems[0]}`).click()
})()

// 设置项初始化
var token = ""
var settings = {
    localhostMode: "false"
}

!(function () {
    token = localStorage.getItem("token") || token
    settings.localhostMode = localStorage.getItem("localhostMode") || "false"
})()

// 设置
!(function () {
    let tfToken = document.getElementById("text-field-settings-token")
    let dialog = document.getElementById("settings-dialog")
    let cbLocalhostMode = document.getElementById("checkbox-settings-localhost-mode")

    document.getElementById("buttonSettings").addEventListener("click", () => {
        dialog.open = true
        tfToken.value = token
        cbLocalhostMode.checked = settings.localhostMode == "true"
    })
    document.getElementById("button-settings-discard").addEventListener("click", () => {
        dialog.open = false
    })
    document.getElementById("button-settings-apply").addEventListener("click", () => {
        dialog.open = false
        localStorage.setItem("token", tfToken.value)
        localStorage.setItem("localhostMode", cbLocalhostMode.checked)
        location.reload()
    })
})()


//
async function api(target, params) {
    let queryString = params ? Object.keys(params).map(key => key + '=' + encodeURIComponent(params[key])).join('&') : ''

    const baseURL = settings.localhostMode == "true" ? "http://localhost/api" : "https://oni.akyuu.cn/api"

    const methodMap = {
        "/web/getTimeStarted": "GET",
        "/web/getUserData": "GET",
        "/web/getRtData": "GET",
        "/web/getBotList": "GET",
        "/web/getServerLog": "GET",
        "/web/getAeCpusData": "GET",
        "/ping": "GET"
    }

    let requestOptions = { method: methodMap[target] || 'GET' }

    try {
        const response = await fetch(baseURL + target + "?" + queryString, requestOptions);
        if (!response.ok) {
            mdui.snackbar({
                message: target + " API 请求出现了错误，请报告给开发者",
                closeable: true,
                placement: "bottom-end"
            })
        }
        return await response.json()
    } catch (error) {
        console.error('error', error)
        return null
    }
}

//
// Panel-Overview
//

api("/web/getUserData", { token: token }).then(result => {
    const msg = (result.code == 0) ? `欢迎回来，格雷员工 ${result.data.name}！` : "身份验证失败，请检查 Token。"

    if (result.code == 0) {
        document.getElementById("text-overview-welcome-sub").innerText += result.data.name
        mdui.snackbar({
            message: `欢迎回来，格雷员工 ${result.data.name}！`,
            placement: "bottom-end",
            autoCloseDelay: 2000
        })
    } else {
        mdui.snackbar({
            message: "身份验证失败，请检查 Token。",
            placement: "bottom-end",
            closeable: true
        })
    }
})

var barBattery
var barOnibot

initPanelOverview()
updatePanelOverview()
setInterval(() => {
    updatePanelOverview()
}, 5000)


function initPanelOverview() {

    barBattery = new ProgressBar.Circle("#progressbar-battery", {
        color: '#aaa',
        strokeWidth: 4,
        trailWidth: 2,
        easing: 'easeInOut',
        duration: 1400,
        text: {
            autoStyleContainer: false
        },
        from: { color: '#f55' },
        to: { color: '#5f5' },

        step: function (state, circle) {
            circle.path.setAttribute('stroke', state.color)

            var value = Math.round(circle.value() * 100)
            circle.setText(value + "%")


        }
    })
    barBattery.text.style.color = '#999'
    barBattery.text.style.fontSize = '2rem'

    barOnibot = new ProgressBar.Circle("#progressbar-onibot", {
        color: '#aaa',
        strokeWidth: 4,
        trailWidth: 2,
        easing: 'easeInOut',
        duration: 1400,
        text: {
            autoStyleContainer: false
        },
        from: { color: '#f55' },
        to: { color: '#5f5' },
        step: function (state, circle) {
            circle.path.setAttribute('stroke', state.color)
            var value = Math.round(circle.value() * 100)
            circle.setText(value + "%")
        }

    })
    barOnibot.text.style.color = '#999'
    barOnibot.text.style.fontSize = '2rem'

    barAeCpus = new ProgressBar.Circle("#progressbar-ae-cpus", {
        color: '#aaa',
        strokeWidth: 4,
        trailWidth: 2,
        easing: 'easeInOut',
        duration: 1400,
        text: {
            autoStyleContainer: false
        },
        from: { color: '#5f5' },
        to: { color: '#f55' },
        step: function (state, circle) {
            circle.path.setAttribute('stroke', state.color)
            var value = Math.round(circle.value() * 100)
            circle.setText(value + "%")
        }

    })
    barAeCpus.text.style.color = '#999'
    barAeCpus.text.style.fontSize = '2rem'
}

function updatePanelOverview() {
    api("/web/getRtData", { token: token, name: "battery" }).then((result => {
        barBattery.animate(result.data.value / result.data.max)
        let value = Math.floor(result.data.value / 1000)
        let max = Math.floor(result.data.max / 1000)
        let unit = "K" + result.data.unit
        let euio = result.data.euio
        euio = euio > 0 ? "+" + euio : euio
        document.getElementById("progressbar-battery-text").innerText = `${value}/${max} ${unit}`
        document.getElementById("progressbar-battery-textio").innerText = `avg: ${euio} EU/t`
    }))
    api("/web/getBotList", { token: token }).then(result => {
        let max = result.data.length
        let value = result.data.filter(bot => {
            const timeDifference = Date.now() - bot.lastseen
            return timeDifference <= 60000
        }).length

        barOnibot.animate(value / max)
        document.getElementById("progressbar-onibot-text").innerText = `${value}/${max} 设备`
    })
    api("/web/getAeCpusData", { token: token }).then(result => {
        let max = result.data.length
        let value = result.data.filter(cpu => { return cpu.busy }).length

        barAeCpus.animate(value / max)
        document.getElementById("progressbar-ae-cpus-text").innerText = `${value}/${max} 核心工作中`
    })
}


//
// Panel-AE
//

initPanelAe()
updatePanelAe()
setInterval(() => {
    updatePanelAe()
}, 5000)

function initPanelAe() {
    let AeCoreList = document.getElementById("ae-core-container")
    AeCoreList.innerHTML = ""
}

function updatePanelAe() {
    api("/web/getAeCpusData", { token: token }).then(result => {
        let AeCoreList = document.getElementById("ae-core-container")
        AeCoreList.innerHTML = ""
        result.data.forEach((core, i) => {
            const name = core.name
            const icon = core.busy ? "settings_suggest" : "download_done"
            const text = core.busy ? "合成中" : "空闲"
            const item = core.finalOutputLabel
            const num = core.finalOutputLeft
            const info = core.busy ? `<div style="margin-top: .5rem;">剩余：${item} * ${num}</div>` : ""
            AeCoreList.innerHTML += `
            <mdui-card class="ae-core-card" variant="filled">
            <div class="ae-core-card-title">
              <mdui-icon name='${icon}'></mdui-icon>
              &nbsp;&nbsp;
              <div>
                <div>CPU ${i} <span style="opacity: 0.7">- "${name}"</span></div>
                <div style="font-weight: normal;font-size: .8rem;opacity: 0.5">${text}</div>
              </div>
            </div>
            ${info}
          </mdui-card>
            `
        })
    })
}


//
// Panel-Bot
//

initPanelBot()
updatePanelBot()
setInterval(() => {
    updatePanelBot()
}, 5000)

function initPanelBot() {
    let botList = document.getElementById("bot-list")
    botList.innerHTML = ""
}

function updatePanelBot() {
    api("/web/getBotList", { token: token }).then(result => {
        let botList = document.getElementById("bot-list")
        botList.innerHTML = ""
        result.data.forEach((bot, i) => {
            const timeDifference = Date.now() - bot.lastseen
            const isOnline = timeDifference < 60000 ? true : false
            const opacity = isOnline ? 1 : 0.5
            const icon = isOnline ? "done" : "error"
            let statusText
            if (isOnline) {
                const s = Math.floor(timeDifference / 1000)
                if (s < 10) {
                    statusText = "刚刚"
                } else {
                    statusText = Math.floor(timeDifference / 1000) + " 秒前"
                }
            } else {

                if (Math.floor(timeDifference / 1000 / 60) <= 60) {
                    statusText = "离线 | " + Math.floor(timeDifference / 1000 / 60) + " 分钟前"
                }
                else if (Math.floor(timeDifference / 1000 / 60 / 60) <= 24) {
                    statusText = "离线 | " + Math.floor(timeDifference / 1000 / 60 / 60) + " 小时前"
                }
                else {
                    statusText = "离线"
                }
            }

            botList.innerHTML += `
            <mdui-list-item alignment="center" description="${bot.description}" style="opacity: ${opacity};">
            ${bot.name}
              <mdui-icon slot="icon" name="filter_${i + 1}"></mdui-icon>
              <div slot="end-icon" class="bot-card-end-icon">
                <span style="opacity: 0.5;">${statusText}</span>
                &nbsp;&nbsp;
                <mdui-icon name="${icon}"></mdui-icon>
              </div>
            </mdui-list-item>
            `
        })
    })
}

//
// Panel-Debug
//
var logListDataTemp = ""
initPanelDebug()
updatePanelDebug()
setInterval(() => {
    updatePanelDebug()
}, 5000)

function isEqual(obj1, obj2) {
    if (typeof obj1 !== typeof obj2) {
        return false
    }

    if (typeof obj1 !== 'object' || obj1 === null || obj2 === null) {
        return obj1 === obj2
    }

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
        return false
    }

    for (const key of keys1) {
        if (!keys2.includes(key) || !isEqual(obj1[key], obj2[key])) {
            return false
        }
    }

    return true
}

function initPanelDebug() {
    let logList = document.getElementById("log-list")
    logList.innerHTML = ""
}

function updatePanelDebug() {
    api("/web/getServerLog", { token: token }).then(result => {
        if (!isEqual(result.data, logListDataTemp)) {
            logListDataTemp = result.data
            let logList = document.getElementById("log-list")
            logList.innerHTML = ""
            result.data.slice().reverse().forEach(log => {
                let style = ""
                let icon = ""
                if (log.type == "info") {
                    style = ""
                    icon = "info"
                } else if (log.type == "warn") {
                    style = 'style="background-color: rgb(var(--mdui-color-tertiary-container));"'
                    icon = "warning"
                } else if (log.type == "error") {
                    style = 'style="background-color: rgb(var(--mdui-color-error-container));"'
                    icon = "report"
                } else if (log.type == "debug") {
                    style = ""
                    icon = "bug_report"
                }

                logList.innerHTML += `
            <mdui-collapse-item ${style}>
            <mdui-list-item slot="header" icon="${icon}">${log.part}: ${log.text}
              <div slot="end-icon">
                ${log.time}
              </div>
            </mdui-list-item>
            <div style="margin-left: 2.5rem; margin-bottom: 1rem; margin-top: 1rem;">
                ${log.text}
            </div>
          </mdui-collapse-item>
          `

            })
        }
    })
}

