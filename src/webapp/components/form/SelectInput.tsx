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

const StyledSelect = styled(Select)<{
    $borderColor?: string;
    $height?: string | number;
    $padding?: string | number;
}>`
    .MuiOutlinedInput-notchedOutline {
        border-color: ${({ $borderColor }) => $borderColor || "red"};
    }

    &:hover .MuiOutlinedInput-notchedOutline {
        border-color: ${({ $borderColor }) => $borderColor || "red"};
    }

    &.Mui-focused .MuiOutlinedInput-notchedOutline {
        border-color: ${({ $borderColor }) => $borderColor || "red"};
    }

    .MuiSelect-select {
        background-color: transparent !important;

        &:focus {
            background-color: transparent !important;
        }
    }

    height: ${({ $height }) => ($height ? `${$height}` : "40px")};
`;

const StyledOutlinedInput = styled(OutlinedInput)<{
    $borderColor?: string;
    $height?: string | number;
    $padding?: string | number;
}>`
    & .MuiOutlinedInput-notchedOutline {
        border-color: ${({ $borderColor }) => $borderColor || "red"};
    }

    &:hover .MuiOutlinedInput-notchedOutline {
        border-color: ${({ $borderColor }) => $borderColor || "red"};
    }

    &.Mui-focused .MuiOutlinedInput-notchedOutline {
        border-color: ${({ $borderColor }) => $borderColor || "red"};
    }

    height: ${({ $height }) => ($height ? `${$height}` : "40px")};
    padding: ${({ $padding }) => ($padding ? `${$padding}` : "10px")};

    // Prevent default padding override inside input root
    &.MuiOutlinedInput-root {
        padding: 0;
    }

    .MuiSelect-select {
        background-color: transparent !important;

        &:focus {
            background-color: transparent !important;
        }
    }
`;

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
                input={
                    <StyledOutlinedInput label={label} $borderColor={borderColor} $height={height} $padding={padding} />
                }
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
