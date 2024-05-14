local component = require("component")
local json = require("utils/dkjson")
local internet = require("internet")
local token = ""
-- local table = component.list()
-- printTable(table)

local function urlencode(str)
    str = string.gsub(str, "\n", "\r\n")
    str = string.gsub(str, "([^%w %-%_%.%~])",
        function(c) return string.format("%%%02X", string.byte(c)) end)
    str = string.gsub(str, " ", "+")
    return str
end

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


local response = internet.request(url .. "?token=" .. token .. "&data=" .. urlencode(json.encode(tableFinal)), {}, {}, "PUT")

local responseData = ""
for chunk in response do
    responseData = responseData .. chunk
end

result = responseData