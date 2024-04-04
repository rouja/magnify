import { MicDisabledIcon, MicIcon, useRemoteParticipants } from "@livekit/components-react"
import { useRoomService } from "../../../../../services/livekit/room.services"
import React from "react"
import { Button, Decision, useModals } from "@openfun/cunningham-react"

export const BulkActions = () => {
    const roomService = useRoomService()
    const participants = useRemoteParticipants()
    const [allVideoMuted, setallVideoMuted] = React.useState<boolean>(false)
    const [allAudioMuted, setAllAudioMuted] = React.useState<boolean>(false)
    const [allScreenMuted, setallScreenMuted] = React.useState<boolean>(false)
    const modals = useModals()

    const confirmBulk = async (): Promise<boolean> => {
        return await modals.confirmationModal({ children: `Cette action affectera tous les utilisateurs` })
            .then((decision: Decision) => {
                return decision == "yes" ? true : false
            }).catch(() => false)
    }

    const tAudio = () => {
        confirmBulk().then((choice) => {
            if (choice == true) {
                const res = participants.map((p) => {
                    return roomService.describe(p).then((permissions) => {
                        const index = permissions.canPublishSources.indexOf("MICROPHONE")
                        if (allAudioMuted) {
                            index === -1 && permissions.canPublishSources.push("MICROPHONE")
                        } else {
                            index !== -1 && permissions.canPublishSources.splice(index,1)
                        }
                        return roomService.setAllowedSources(p, permissions.canPublishSources).then(() => true).catch(() => false)
                    })
                })
                Promise.all(res).then(() => {setAllAudioMuted(!allAudioMuted)});
                
            }
        })
    }

    return (
        <div style={{ justifyContent: "center", display: "flex", gap: "0.5em" }}>
            <Button style={{ backgroundColor: "transparent" }} onClick={tAudio} icon={!allAudioMuted ? <MicIcon /> : <MicDisabledIcon  />} >{!allAudioMuted ? "Couper tous les micros" : "Autoriser à parler"}</Button>
        </div>
    )
}