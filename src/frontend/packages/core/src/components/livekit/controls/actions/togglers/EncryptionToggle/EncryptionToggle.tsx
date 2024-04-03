import { useRoomContext } from "@livekit/components-react"
import { Button } from "@openfun/cunningham-react"
import { Form, Formik } from 'formik';
import { useState, useMemo } from "react"

import { LockIcon } from "../../../../assets/icons"
import { FormikInput } from '../../../../../design-system/Formik/Input/FormikInput';
import * as Yup from 'yup';
import { FormikSubmitButton } from '../../../../../design-system/Formik/SubmitButton/FormikSubmitButton';
import { Box, Layer } from 'grommet';
import { ExternalE2EEKeyProvider } from "livekit-client";


export const EncryptionToggle = () => {
    const room = useRoomContext()
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
        const key = values.name;
        (room.options.e2ee?.keyProvider as ExternalE2EEKeyProvider).setKey(key)
        room?.setE2EEEnabled(true)
        handleClose();

    }

    return (
        <div>
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