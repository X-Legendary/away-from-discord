import { app , powerMonitor, Tray, Menu, shell } from "electron"
import Activity from "./activity"
const config = JSON.parse(require("fs").readFileSync("./config.json", "utf8")) // lazy

const activity = new Activity(config.clientId, config.activity)

let tray: Tray
let isIdle = false
let isEnabled = true
const idleCheck = () => {
    const idleTime = powerMonitor.getSystemIdleTime()
    if(idleTime < config.idleTimeMinimum) return isIdle = false

    activity.setStartTimestamp(new Date(Date.now() - idleTime * 1000))
    isIdle = true
}

const update = () => {
    if(!isIdle) return activity.clear()
    activity.update()
}

const updateTray = () => {
    const menu = Menu.buildFromTemplate([
        { label: `${app.getName()} v${app.getVersion()}`, enabled: false },
        { type: "separator" },
        { label: "Enabled", type: "checkbox", checked: isEnabled,
            click: () => {
                isEnabled = !isEnabled
                updateTray()
            }
        },
        { label: "Edit Config", 
            click: () =>  {
                shell.openPath("config.json").catch(() => null)
                updateTray()
            }
        },
        { label: "Start on boot", 
            click: () =>  {
                let setting = !app.getLoginItemSettings().openAtLogin
                app.setLoginItemSettings({
                    openAtLogin: setting,
                    //path: app.getPath("exe")
                })
            },
            checked: app.getLoginItemSettings().openAtLogin,
            type: "checkbox"
        },
        { type: "separator" },
        { label: "Exit", click: () => app.quit() }
    ])
    tray.setContextMenu(menu)
}

app.on("ready", () => {
    console.log("Electron app is ready!")
    setInterval(idleCheck, (config.idleCheckInterval < 5 ? 5_000 : config.idleCheckInterval * 1000))
    setInterval(update, (config.rpcRefreshInterval < 15 ? 15_000 : config.rpcRefreshInterval * 1000))

    tray = new Tray("./icon.ico")
    tray.setToolTip(`${app.getName()} v${app.getVersion()}`)
    updateTray()
})

app.on("before-quit", () => {
    activity.clear()
    activity.disconnect()
    tray.destroy()
})