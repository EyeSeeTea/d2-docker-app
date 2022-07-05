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
        if (input.value) {
            compositionRoot.container.getImages.execute(input.value).run(
                images => {
                    const options = images.map(tag => ({ value: tag.name, label: tag.name }));
                    setArtifactOptions(options);
                },
                error => console.error(error)
            );
        }
    }, [compositionRoot, input.value]);

    const imageInputOnChange = imageInput.onChange;
    useEffect(() => {
        imageInputOnChange(artifactOptions && artifactOptions[0] ? artifactOptions[0].value : undefined);
    }, [artifactOptions, imageInputOnChange]);

    const onChange = useCallback<NonNullable<SingleSelectFieldProps["onChange"]>>(
        ({ selected }, ev) => {
            const project = projects.find(item => item.value === selected);
            if (project && input.onChange) {
                input.onChange(project.value, ev);
                imageInput.onChange(undefined);
            }
        },
        [projects, input, imageInput]
    );

    const onChangeOptionCombo = useCallback(
        ({ selected }) => {
            const optionCombo = artifactOptions.find(item => item.value === selected);

            if (optionCombo) {
                imageInput.onChange(optionCombo.value);
            }
        },
        [imageInput, artifactOptions]
    );

    return (
        <React.Fragment>
            <SingleSelectField onChange={onChange} selected={input.value}>
                {projects.map(({ value, label }) => (
                    <SingleSelectOption value={value} label={label} key={value} />
                ))}
            </SingleSelectField>

            {_(projects).some(({ value }) => value === input.value) && (
                <React.Fragment>
                    <Row>{getNewContainerFieldName("image")}</Row>

                    <SingleSelectField onChange={onChangeOptionCombo} selected={imageInput.value}>
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
