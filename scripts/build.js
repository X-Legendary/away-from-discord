const packager = require("electron-packager")
const packageJSON = require("../package.json")

const buildForCurrent = (process.argv[2] === "current" ? undefined : "all")

try {
    packager({
        name: "Away from Discord",
        dir: ".",
        appVersion: packageJSON.version,
        buildVersion: Date.now().toString(),
        appCopyright: `Copyright © ${packageJSON.author} ${new Date().getFullYear()}`,
        all: buildForCurrent,
        asar: true,
        executableName: "afd",
        icon: "./icon.ico",
        out: "./build",
        overwrite: true,
    })
} catch(e) {
    console.log("Couldn't create package")
    console.log(e)
}