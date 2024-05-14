local thread = require("thread")
local update = require("update")
function getTimeString()
    local timeString = os.date('%Y-%m-%d %H:%M:%S')
    return timeString
end

print("                                              ")
print("             ██████╗ ███╗   ██╗██╗            ")
print("            ██╔═══██╗████╗  ██║██║            ")
print("  █████╗    ██║   ██║██╔██╗ ██║██║    █████╗  ")
print("  ╚════╝    ██║   ██║██║╚██╗██║██║    ╚════╝  ")
print("            ╚██████╔╝██║ ╚████║██║            ")
print("             ╚═════╝ ╚═╝  ╚═══╝╚═╝            ")
print("                 \"Project Oni\"                ")
print("                                              ")
print("Suika Started at " .. getTimeString())
local t1,t2
while true do
    t1 = thread.create(update.battery)
    t2 = thread.create(update.aeCpus)
    os.execute("sleep 5")
end
