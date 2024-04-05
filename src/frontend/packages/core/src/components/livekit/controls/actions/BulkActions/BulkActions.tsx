import { MicDisabledIcon, MicIcon, useRemoteParticipants } from "@livekit/components-react"
import { useRoomService } from "../../../../../services/livekit/room.services"
import React from "react"
import { Button, Decision, useModals } from "@openfun/cunningham-react"
import { defineMessages, useIntl } from 'react-intl';

const messages = defineMessages({
    affectAll: {
        defaultMessage: 'This action will affect all users',
        description: 'The message to display when there is no one',
        id: 'components.rooms.participants.affectAll',
    },
    allMicDown: {
        defaultMessage: 'Stop all microphones',
        description: 'The message to display when there is no one',
        id: 'components.rooms.participants.allMicDown',
    },
    allMicUp: {
        defaultMessage: 'Allow to talk',
        description: 'The message to display when there is no one',
        id: 'components.rooms.participants.allMicUp',
    }
})

export const BulkActions = () => {
    const intl = useIntl()
    const roomService = useRoomService()
    const participants = useRemoteParticipants()
    const [allVideoMuted, setallVideoMuted] = React.useState<boolean>(true)
    const [allAudioMuted, setallAudioMuted] = React.useState<boolean>(false)
    const [allScreenMuted, setallScreenMuted] = React.useState<boolean>(true)
    const modals = useModals()

    const confirmBulk = async (): Promise<boolean> => {
        return await modals.confirmationModal({ children: intl.formatMessage(messages.affectAll) })
            .then((decision: Decision) => {
                return decision == "yes" ? true : false
            }).catch(() => false)
    }

    const tVideo = () => {
        confirmBulk().then((choice) => {
            if (choice == true) {
                const sources = [...!allVideoMuted ? ["CAMERA"] : [], ...allAudioMuted ? ["MICROPHONE"] : [], ...allScreenMuted ? ["SCREEN_SHARE", "SCREEN_SHARE_AUDIO"] : []]
                const res = participants.map((p) => roomService.setAllowedSources(p, sources).then(() => true).catch(() => false)).every(Boolean)
                if (res) {
                    setallVideoMuted(!allVideoMuted)
                }
            }
        })

    }

    const tAudio = () => {
        confirmBulk().then((choice) => {
            if (choice == true) {
                const sources = [...allVideoMuted ? ["CAMERA"] : [], ...!allAudioMuted ? ["MICROPHONE"] : [], ...allScreenMuted ? ["SCREEN_SHARE", "SCREEN_SHARE_AUDIO"] : []]
                const res = participants.map((p) => roomService.setAllowedSources(p, sources).then(() => true).catch(() => false)).every(Boolean)
                if (res) {
                    setallAudioMuted(!allAudioMuted)
                }
            }
        })
    }

    const tScreen = () => {
        confirmBulk().then((choice) => {
            if (choice == true) {
                const sources = [...allVideoMuted ? ["CAMERA"] : [], ...allAudioMuted ? ["MICROPHONE"] : [], ...!allScreenMuted ? ["SCREEN_SHARE", "SCREEN_SHARE_AUDIO"] : []]
                const res = participants.map((p) => roomService.setAllowedSources(p, sources).then(() => true).catch(() => false)).every(Boolean)
                if (res) {
                    setallScreenMuted(!allScreenMuted)
                }
            }
        })
    }

    return (
        <div style={{ justifyContent: "center", display: "flex", gap: "0.5em" }}>
            <Button style={{ backgroundColor: "transparent" }} onClick={tAudio} icon={allAudioMuted ? <MicDisabledIcon /> : <MicIcon />} >{!allAudioMuted ? intl.formatMessage(messages.allMicDown) : intl.formatMessage(messages.allMicUp)}</Button>
        </div>
    )
}