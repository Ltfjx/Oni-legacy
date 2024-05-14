potato = {}

function potato.urlencode(str)
    str = string.gsub(str, "\n", "\r\n")
    str = string.gsub(str, "([^%w %-%_%.%~])",
        function(c) return string.format("%%%02X", string.byte(c)) end)
    str = string.gsub(str, " ", "+")
    return str
end

return potato