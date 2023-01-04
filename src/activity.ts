import * as DiscordRPC from "discord-rpc"

class Activity {
    private client: DiscordRPC.Client
    private activity: DiscordRPC.Presence
    private startTimestamp: Date

    constructor(clientId: string, activity: any) {
        this.client = new DiscordRPC.Client({ transport: "ipc" } )
        this.startTimestamp = new Date()
        this.activity = { ...activity, ...{ startTimestamp: this.startTimestamp } }
        this.client.on("ready", () => {
            console.log(`
                RPC Client ready!
                Logged in as: ${this.client.application?.name || "none"}
                Authed for user: ${this.client.user?.username || "none"}
            `)
            //this.client.setActivity(this.activity)
        })

        this.client.login({ clientId, /*,scopes: ["rpc" "identify"]*/ }).catch(() => null)
    }

    update(newActivity?: DiscordRPC.Presence) {
        if(newActivity) this.activity = { ...newActivity, ...{ startTimestamp: this.startTimestamp } }
        this.client.setActivity(this.activity)
    }
    
    setStartTimestamp(newStartTimestamp: Date) {
        this.startTimestamp = newStartTimestamp
    }

    disconnect() {
        this.client.destroy()
    }

    clear() {
        this.client.clearActivity()
    }
}

export default Activity