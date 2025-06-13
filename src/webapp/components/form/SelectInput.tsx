import { CircularProgress, FormControl, InputLabel, MenuItem, OutlinedInput, Select } from "@material-ui/core";
import React from "react";
import styled from "styled-components";

export interface SelectOption {
    value: string;
    label: string;
}

export interface SelectInputProps {
    label?: string;
    value: string;
    options: SelectOption[];
    disabled?: boolean;
    loading?: boolean;
    loadingText?: string;
    onChange: (event: React.ChangeEvent<{ name?: string; value: unknown }>) => void;
    borderColor?: string;
    height?: string | number;
    padding?: string | number;
}

const StyledSelect = styled(Select)`
    height: 40px;
    font-size: 14px;

    & .d2da-MuiOutlinedInput-notchedOutline {
        border-color: #a0adba;
    }

    &.d2da-MuiOutlinedInput-root:hover .d2da-MuiOutlinedInput-notchedOutline {
        border-color: #a0adba;
    }

    & .d2da-MuiSelect-select:focus {
        background-color: transparent;
    }

    &.d2da-MuiOutlinedInput-root.Mui-focused .d2da-MuiOutlinedInput-notchedOutline {
        border-color: #009488;
    }
`;

// const StyledOutlinedInput = styled(OutlinedInput)<{
//     $borderColor?: string;
//     $height?: string | number;
//     $padding?: string | number;
// }>`
//     & .d2da-MuiOutlinedInput-notchedOutline {
//         border-color: rgb(160, 173, 186);
//         border-radius: 4px;
//     }
//
//     height: 40px;
//     font-size: 14px;
// `;

export const SelectInput: React.FC<SelectInputProps> = ({
    label,
    value,
    options,
    disabled,
    loading = false,
    onChange,
    borderColor,
    height,
    padding,
}) => {
    return (
        <FormControl fullWidth variant="outlined">
            {label && <InputLabel>{label}</InputLabel>}
            <StyledSelect
                disabled={disabled}
                value={value}
                onChange={onChange}
                label={label}
                // input={
                //     <StyledOutlinedInput label={label} $borderColor={borderColor} $height={height} $padding={padding} />
                // }
            >
                {loading ? (
                    <MenuItem disabled>
                        <CircularProgress size={20} style={{ marginRight: 10 }} />
                        Loading options...
                    </MenuItem>
                ) : (
                    options.map(({ value, label }) => (
                        <MenuItem value={value} key={value}>
                            {label}
                        </MenuItem>
                    ))
                )}
            </StyledSelect>
        </FormControl>
    );
};
