const packager = require("electron-packager")
const packageJSON = require("../package.json")

const platform = (process.argv[2] ? process.argv[2] : process.platform)
const arch = (process.argv[3] ? process.argv[3] : process.arch)

try {
    packager({
        name: "Away from Discord",
        dir: ".",
        appVersion: packageJSON.version,
        buildVersion: Date.now().toString(),
        appCopyright: `Copyright © ${packageJSON.author} ${new Date().getFullYear()}`,
        platform: platform,
        arch: arch,
        executableName: "afd",
        icon: "./icon.ico",
        out: "./build",
        overwrite: true,
    })
} catch(e) {
    console.log("Couldn't create package")
    console.log(e)
}