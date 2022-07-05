import { FinalFormInput, SingleSelectField, SingleSelectFieldProps, SingleSelectOption } from "@dhis2/ui";
import _ from "lodash";
import React, { useCallback, useState, useEffect } from "react";
import { useField } from "react-final-form";
import styled from "styled-components";
import { useAppContext } from "../../../contexts/app-context";
import { getNewContainerFieldName } from "../NewContainerForm";

export interface CategoryOptionComboFFProps {
    input: FinalFormInput;
    imageField: string;
}

export const ProjectFF: React.FC<CategoryOptionComboFFProps> = ({ input, imageField }) => {
    const { compositionRoot } = useAppContext();
    const { input: imageInput } = useField(imageField);
    const [projects, setProjects] = useState<{ value: string; label: string }[]>([]);
    const [artifactOptions, setArtifactOptions] = useState<{ value: string; label: string }[]>([]);

    useEffect(() => {
        compositionRoot.container.getProjects.execute().run(
            data =>
                setProjects(
                    data
                        .map(item => item.name)
                        .map((name: string) => ({
                            value: name,
                            label: name,
                        }))
                ),
            error => console.error(error)
        );
    }, [compositionRoot]);

    useEffect(() => {
        if (input.value.id) {
            compositionRoot.container.getImages.execute(input.value.id).run(
                images => {
                    const options = images.map(tag => ({ value: tag.name, label: tag.name }));
                    setArtifactOptions(options);
                },
                error => console.error(error)
            );
        }
    }, [compositionRoot, input.value.id]);

    const imageInputOnChange = imageInput.onChange;
    useEffect(() => {
        imageInputOnChange(
            artifactOptions && artifactOptions[0]
                ? { id: artifactOptions[0].value, name: artifactOptions[0].label }
                : undefined
        );
    }, [artifactOptions, imageInputOnChange]);

    const onChange = useCallback<NonNullable<SingleSelectFieldProps["onChange"]>>(
        ({ selected }, ev) => {
            const project = projects.find(item => item.value === selected);
            if (project && input.onChange) {
                input.onChange({ id: project.value, name: project.label }, ev);
                imageInput.onChange(undefined);
            }
        },
        [projects, input, imageInput]
    );

    const onChangeOptionCombo = useCallback(
        ({ selected }) => {
            const optionCombo = artifactOptions.find(item => item.value === selected);

            if (optionCombo) {
                imageInput.onChange({ id: optionCombo.value, name: optionCombo.label });
            }
        },
        [imageInput, artifactOptions]
    );

    return (
        <React.Fragment>
            <SingleSelectField onChange={onChange} selected={input.value.id}>
                {projects.map(({ value, label }) => (
                    <SingleSelectOption value={value} label={label} key={value} />
                ))}
            </SingleSelectField>

            {_(projects).some(({ value }) => value === input.value.id) && (
                <React.Fragment>
                    <Row>{getNewContainerFieldName("image")}</Row>

                    <SingleSelectField onChange={onChangeOptionCombo} selected={imageInput.value.id}>
                        {artifactOptions.map(({ value, label }) => (
                            <SingleSelectOption value={value} label={label} key={value} />
                        ))}
                    </SingleSelectField>
                </React.Fragment>
            )}
        </React.Fragment>
    );
};

const Row = styled.div`
    margin: 20px 0;
`;
