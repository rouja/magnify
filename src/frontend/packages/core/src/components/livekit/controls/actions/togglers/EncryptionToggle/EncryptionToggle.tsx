import { useRoomContext } from "@livekit/components-react"
import { Button } from "@openfun/cunningham-react"
import { Form, Formik } from 'formik';
import { useState, useMemo } from "react"

import { ShieldIcon } from "../../../../assets/icons"
import { FormikInput } from '../../../../../design-system/Formik/Input/FormikInput';
import * as Yup from 'yup';
import { FormikSubmitButton } from '../../../../../design-system/Formik/SubmitButton/FormikSubmitButton';
import { Box, Layer } from 'grommet';
import { ExternalE2EEKeyProvider } from "livekit-client";


export const EncryptionToggle = () => {
    const room = useRoomContext()
    const [open, setOpen] = useState(false);
    const [encrypted, setEncrypted] = useState(false);

    const handleClick = (event: React.MouseEvent) => {
        !encrypted?
        handleOpen(event)
        :
        Unencrypt()
    }

    const Unencrypt = () => {
        room?.setE2EEEnabled(false)
        setEncrypted(!encrypted)
    }

    const handleOpen = (event: React.MouseEvent) => {
        event.preventDefault();
        setOpen(true)
    };

    const handleClose = (event?: React.MouseEvent | React.KeyboardEvent) => {
        event?.preventDefault();
        setOpen(false);
    };

    const handleSubmit = (
        values: EncryptionFormValues,
    ) => {
        const key = values.name;
        (room.options.e2ee?.keyProvider as ExternalE2EEKeyProvider).setKey(key)
        room?.setE2EEEnabled(true)
        handleClose();
        setEncrypted(!encrypted)

    }

    return (
        <div>
            <Button color={encrypted? "secondary" : "primary"} icon={<ShieldIcon />} onClick={handleClick} />
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
            }</div>

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
                Lors du chiffrement, entrez une clé que vous avez partagé avec les autres participants via un moyen sécurisé. <br /><br/>
                <FormikInput
                    {...{ autoFocus: true }}
                    fullWidth
                    label={"clé de chiffrement"}
                    name="name"
                    text={"Entrez la clé de chiffrement"}
                />
                <FormikSubmitButton type={"button"}
                    label={"Chiffrer la conférence"}
                />
            </Form>
        </Formik>
    );
};