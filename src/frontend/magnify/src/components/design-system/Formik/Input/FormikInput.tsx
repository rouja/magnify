import * as React from 'react';
import { FunctionComponent, useState } from 'react';
import { ErrorMessage, useField } from 'formik';
import { Box, Text, TextInput, TextInputProps } from 'grommet';
import styled, { css } from 'styled-components';
import { Hide, View } from 'grommet-icons';
import { normalizeColor } from 'grommet/utils';

const CustomInput = styled(TextInput)`
  ${({ theme }) => css`
    background-color: ${normalizeColor('light-2', theme)};
  `}
  border: none;
`;

export interface FormikInputProps extends TextInputProps {
  label: string;
  name: string;
  placeholder?: string;
}

const FormikInput: FunctionComponent<FormikInputProps> = (props) => {
  const [field] = useField(props.name);
  const [showPassword, setShowPassword] = useState(false);

  const getInputType = (): string => {
    if (props.type === 'password') {
      return showPassword ? 'text' : 'password';
    }
    return props.type ?? 'text';
  };

  return (
    <Box gap={'5px'}>
      <label htmlFor={props.name}>
        <Text
          size={'xsmall'}
          weight={'bold'}
        >{props.label}</Text>
      </label>
      <div>
        <Box style={{ position: 'relative' }}>
          <CustomInput {...field} {...props} ref={null} id={props.name} type={getInputType()} />
          {props.type === 'password' && (
            <Box
              onClick={() => setShowPassword(!showPassword)}
              focusIndicator={false}
              style={{
                cursor: 'pointer',
                position: 'absolute',
                top: '8px',
                right: '10px',
              }}
            >
              {showPassword ? <View /> : <Hide />}
            </Box>
          )}
        </Box>
        <ErrorMessage
          name={props.name}
          render={(msg: string) => {
            return (
                <Text size={'xsmall'} color={'accent-1'}>{msg}</Text>
            );
          }}
        />
      </div>
    </Box>
  );
};

export default FormikInput;