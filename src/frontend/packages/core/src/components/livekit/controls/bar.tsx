import { CameraDisabledIcon, CameraIcon, ChatIcon, LeaveIcon, MediaDeviceMenu, MicDisabledIcon, MicIcon, ScreenShareIcon, ScreenShareStopIcon, TrackToggleProps, UseChatToggleProps, useChatToggle, useDisconnectButton, useLayoutContext, useLocalParticipantPermissions, useRemoteParticipants, useRoomContext, useTrackToggle } from "@livekit/components-react"
import { Button, ToastProps, VariantType, defaultTokens } from "@openfun/cunningham-react"
import { Track } from "livekit-client"
import { Form, Formik, FormikHelpers } from 'formik';
import { Card, DropButton } from "grommet"
import { MouseEventHandler, useState, useMemo } from "react"
import { ParticipantLayoutToggle, RaiseHand } from "./participants"
import { useAudioAllowed, useScreenSharingAllowed, useVideoAllowed } from "../utils/hooks"
import { useIsMobile, useIsSmallSize } from "../../../hooks/useIsMobile"
import { Event, useEventHandler } from "../../../services/livekit/events"
import { LayoutToggle } from "../conference/conference"
import { LockIcon, MoreIcon } from "../utils/icons"
import { tokens } from "../../../cunningham-tokens"
import { useModal } from "../../../context/modals";
import { FormikInput } from '../../design-system/Formik/Input/FormikInput';
import * as Yup from 'yup';
import { FormikSubmitButton } from '../../design-system/Formik/SubmitButton/FormikSubmitButton';
import { Box, Layer } from 'grommet';
import { useErrors } from '../../../hooks/useErrors';




export const Leave = ({ ...props }) => {
    const { buttonProps } = useDisconnectButton(props)
    return (
        <Button onClick={buttonProps.onClick} iconPosition={"right"} style={{ backgroundColor: `${defaultTokens.theme.colors["danger-400"]}` }} icon={<LeaveIcon />} />
    )
}



export const ChatToggle = ({ ...props }: UseChatToggleProps) => {
    const { mergedProps } = useChatToggle(props)
    return (
        <Button onClick={mergedProps.onClick} style={mergedProps.style} icon={<ChatIcon />}></Button>
    )
}

export type ToggleSource = Exclude<
    Track.Source,
    Track.Source.ScreenShareAudio | Track.Source.Unknown
>;

interface MagnifyToggleProps<T extends ToggleSource> {
    props: TrackToggleProps<T>,
    enabledIcon: React.ReactNode,
    disabledIcon: React.ReactNode,
    clickable: boolean
}

export function TrackToggle<T extends ToggleSource>(props: MagnifyToggleProps<T>) {
    const { buttonProps, enabled } = useTrackToggle(props.props);
    const small = useIsSmallSize()
    return (
        <Button style={buttonProps.style} disabled={props.clickable} onClick={buttonProps.onClick as MouseEventHandler<HTMLButtonElement> & MouseEventHandler<HTMLAnchorElement>} icon={enabled ? props.enabledIcon : props.disabledIcon} iconPosition="right">
            {!small && props.props.children}
        </Button>
    );
}

interface ControlBarProps {
    videoControl?: boolean,
    audioControl?: boolean,
    screenSharingControl?: boolean
}

const defaultControlBarProps: ControlBarProps = {
    videoControl: true,
    audioControl: true,
    screenSharingControl: true
}

export const MagnifyControlBar = () => {
    const permissions = useLocalParticipantPermissions()
    const video = useVideoAllowed(permissions)
    const audio = useAudioAllowed(permissions)
    const screenSharing = useScreenSharingAllowed(permissions)
    return <ControlBar videoControl={video} audioControl={audio} screenSharingControl={screenSharing} />
}




export const ControlBar = (props: ControlBarProps) => {
    const modals = useModal()

    const barProps = { ...defaultControlBarProps, ...props }
    const p = useLocalParticipantPermissions()
    const handler = useEventHandler()
    const room = useRoomContext()
    const errors = useErrors();


    const videoEvent = new Event(p, { duration: 3000 } as ToastProps, (p): boolean => {
        return p?.canPublishSources.includes(1) ?? true
    })

    videoEvent.onSwitch(true, false, { computeMessage: () => "Un modérateur a coupé votre caméra", variant: VariantType.INFO })
    videoEvent.onSwitch(false, true, { computeMessage: () => "Un modérateur a autorisé votre caméra", variant: VariantType.SUCCESS })
    handler.watchState(videoEvent)

    const audioEvent = new Event(p, { duration: 3000 } as ToastProps, (p): boolean => {
        return p?.canPublishSources.includes(2) ?? true
    })

    audioEvent.onSwitch(true, false, { computeMessage: () => "Un modérateur a coupé votre microphone", variant: VariantType.INFO })
    audioEvent.onSwitch(false, true, { computeMessage: () => "Un modérateur a autorisé votre microphone", variant: VariantType.SUCCESS })
    handler.watchState(audioEvent)

    const screenEvent = new Event(p, { duration: 3000 } as ToastProps, (p): boolean => {
        return p?.canPublishSources.includes(3) ?? true
    })

    screenEvent.onSwitch(true, false, { computeMessage: () => "Un admin a coupé votre partage d'écran", variant: VariantType.INFO })
    screenEvent.onSwitch(false, true, { computeMessage: () => "Un admin a autorisé votre partage d'écran", variant: VariantType.SUCCESS })
    handler.watchState(screenEvent)



    const r = useRemoteParticipants()

    const joinLeaveEvent = new Event(r, { duration: 3000 } as ToastProps)
    joinLeaveEvent.onCheck((o, t) => o.length > t.length, {
        computeMessage: (o, t) => {
            const newParticpants = o.filter((x) => !t.includes(x))
            return `${newParticpants[0]?.name ?? ""} a quitté la conférence`
        }, variant: VariantType.INFO
    })

    joinLeaveEvent.onCheck((o, t) => (o.length < t.length) && o.length > 0, {
        computeMessage: (o, t) => {
            const newParticpants = t.filter((x) => !o.includes(x))
            return `${newParticpants[0]?.name ?? ""} a rejoins la conférence`
        }, variant: VariantType.INFO
    })
    handler.watchState(joinLeaveEvent)

    const mobile = useIsMobile()

    const mobileSelector =
        <div style={{ color: "white", backgroundColor: `${tokens.theme.colors["primary-400"]}`, flexDirection: "row", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <LayoutToggle />
            <RaiseHand />
        </div>
const [open, setOpen] = useState(false);

const handleOpen = (event: React.MouseEvent) => {
    event.preventDefault();
    setOpen(true);
};

const handleClose = (event?: React.MouseEvent | React.KeyboardEvent) => {
    event?.preventDefault();
    setOpen(false);
};

const handleSubmit = (
    values: EncryptionFormValues,
) => {
    const key = values.name
    room.options.e2ee?.keyProvider.setKey(key)
    room?.setE2EEEnabled(true)
    handleClose();
    
}

const logKey = () => {

    console.log(room.options.e2ee?.keyProvider);
}


    return (
        <div style={{ padding: "1em", display: 'flex', alignItems: "center", justifyContent: "center", gap: "1em" }}>
            {!mobile &&
                <>
                    <Card style={{ borderRadius: "0.6em", display: "flex", flexDirection: "row" }} className="bg-primary-400">
                        <RaiseHand />
                    </Card>
                    <Card style={{ borderRadius: "0.6em", display: "flex", flexDirection: "row" }} className="bg-primary-400">
                        <ParticipantLayoutToggle />
                    </Card>
                </>
            }

            <Card style={{ borderRadius: "0.6em", display: "flex", flexDirection: "row" }} className="bg-primary-400">
                <TrackToggle props={{ source: Track.Source.Microphone }} clickable={!barProps.audioControl ?? false} enabledIcon={<MicIcon />} disabledIcon={<MicDisabledIcon />} />
                <MediaDeviceMenu style={{ backgroundColor: `${tokens.theme.colors["primary-400"]}` }} kind="audioinput" />
            </Card>

            <Card style={{ borderRadius: "0.6em", display: "flex", flexDirection: "row" }} className="bg-primary-400">
                <TrackToggle props={{ source: Track.Source.Camera }} clickable={!barProps.videoControl ?? false} enabledIcon={<CameraIcon />} disabledIcon={<CameraDisabledIcon />} />
                <MediaDeviceMenu style={{ backgroundColor: `${tokens.theme.colors["primary-400"]}` }} kind="videoinput" />
            </Card>

            {!mobile &&
                <Card style={{ borderRadius: "0.6em", display: "flex", flexDirection: "row" }} className="bg-primary-400">
                    <TrackToggle props={{ source: Track.Source.ScreenShare }} clickable={!barProps.screenSharingControl ?? false} enabledIcon={<ScreenShareStopIcon />} disabledIcon={<ScreenShareIcon />} />
                </Card>
            }


            {!mobile &&
                <Card style={{ borderRadius: "0.6em", display: "flex", flexDirection: "row" }} className="bg-primary-400">
                    <ChatToggle props={{}} />
                </Card>
            }

            {mobile &&
                <DropButton dropContent={mobileSelector} dropProps={{ justify: "center", alignContent: "center", alignSelf: "center", elevation: "none" }} margin={"none"} style={{ padding: "0.8em", display: "flex", justifyContent: "center", backgroundColor: `${tokens.theme.colors["primary-400"]}` }} dropAlign={{ top: "bottom" }} >
                    <MoreIcon />
                </DropButton>
            }

            {!mobile &&
                <Card style={{ borderRadius: "0.6em", display: "flex", flexDirection: "row" }} className="bg-primary-400">
                    <LayoutToggle />
                </Card>

            }

            <Card style={{ borderRadius: "0.6em", display: "flex", flexDirection: "row" }} className="bg-primary-400">
                <Button color="primary" icon={<LockIcon />} onClick={handleOpen} />
                {open && 
                        <Layer
                        id="confirmDelete"
                        onClickOutside={handleClose}
                        onEsc={handleClose}
                        position="center"
                        role="dialog"
                    >
                        <Box pad="medium" width="medium">
            <EncryptionForm handleSubmit={handleSubmit} />
            </Box>
        </Layer>
            }
            </Card>
            <Leave />
        </div>
    )
}



interface EncryptionFormValues {
    name: string;
}

const EncryptionForm = (EncryptionFormProps: any) => {
    
    const validationSchema = Yup.object().shape({ name: Yup.string().required() });

    const initialValues: EncryptionFormValues = useMemo(
        () => ({
            name: '',
        }),
        [],
    )

    return (
                <Formik
                    initialValues={initialValues}
                    onSubmit={EncryptionFormProps.handleSubmit}
                    validationSchema={validationSchema}
                >
                    <Form>
                        <FormikInput
                            {...{ autoFocus: true }}
                            fullWidth
                            label={"clé de chiffrement"}
                            name="name"
                            text={"Entrez la clé de chiffrement "}
                        />
                        <FormikSubmitButton type={"button"}
                            label={"Chiffrer la conférence"}
                        />
                    </Form>
                </Formik>


    );
};