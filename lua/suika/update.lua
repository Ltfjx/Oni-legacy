local internet = require("internet")
local component = require("component")
local json = require("utils/dkjson")
local utils = require("utils/potato")
local token = ""
update = {}

function update.battery()
    local url = "https://oni.akyuu.cn/api/oc/putRtData"

    local address = "408a5e2d-9738-41d9-a24d-78e014afd9fd"
    local proxy = component.proxy(address)

    -- Avg EU Test --
    local valueStart = proxy.getStoredEU()
    os.execute("sleep 5")
    local valueEnd = proxy.getStoredEU()
    -- Avg EU Test --

    local max = proxy.getEUCapacity()
    local euio = math.floor((valueEnd - valueStart) / 100)

    local response = internet.request(
        url .. "?token=" .. token .. "&name=battery&value=" .. valueEnd .. "&max=" .. max .. "&euio=" .. euio, {}, {},
        "PUT")

    local responseData = ""
    for chunk in response do
        responseData = responseData .. chunk
    end

    result = responseData
    -- print(result)
end

function update.aeCpus()
    local url = "https://oni.akyuu.cn/api/oc/putAeCpusData"

    local address = "98335c82-d411-48cb-91f0-a6017d54da6a"
    local proxy = component.proxy(address)

    local tableCPU = proxy.getCpus()

    local tableFinal = {}

    for i = 1, #tableCPU do
        local name, busy, itemLabel, itemLeft
        name = tableCPU[i].name
        busy = tableCPU[i].busy
        if busy then
            itemLabel = tableCPU[i].cpu.finalOutput().label
            itemLeft = tableCPU[i].cpu.finalOutput().size
        end

        -- 写入总table
        tableFinal[i] = {}
        tableFinal[i]["name"] = name
        tableFinal[i]["busy"] = busy
        tableFinal[i]["finalOutputLabel"] = itemLabel
        tableFinal[i]["finalOutputLeft"] = itemLeft
        name, busy, itemLabel, itemLeft = nil, nil, nil, nil
    end

    local response = internet.request(url .. "?token=" .. token .. "&data=" .. utils.urlencode(json.encode(tableFinal)),
        {}, {}, "PUT")

    local responseData = ""
    for chunk in response do
        responseData = responseData .. chunk
    end

    result = responseData
end

return update
