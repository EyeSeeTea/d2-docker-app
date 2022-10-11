import { FinalFormInput, SingleSelectField, SingleSelectFieldProps, SingleSelectOption } from "@dhis2/ui";
import { useSnackbar } from "@eyeseetea/d2-ui-components";
import _ from "lodash";
import React, { useCallback, useState, useEffect } from "react";
import { useField } from "react-final-form";
import styled from "styled-components";
import { initFuture } from "../../../../domain/entities/Future";
import { Image } from "../../../../domain/entities/Image";
import { Project } from "../../../../domain/entities/Project";
import { useAppContext } from "../../../contexts/app-context";
import { getContainerFieldName } from "../ContainerForm";

export interface CategoryOptionComboFFProps {
    input: FinalFormInput;
    imageField: string;
    disabled: boolean;
}

type Loader<Data> =
    | { type: "idle" }
    | { type: "loading" }
    | { type: "loaded"; data: Data }
    | { type: "error"; error: string };

const noProjects: Project[] = [];
const noImages: Image[] = [];

export const ProjectFF: React.FC<CategoryOptionComboFFProps> = props => {
    const { input: projectInput, imageField, disabled } = props;
    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();
    const { input: imageInput } = useField<Image>(imageField);
    const imageInputOnChange = imageInput.onChange;

    const [projectsLoader, setProjectsLoader] = useState<Loader<Project[]>>({ type: "idle" });
    const [imagesLoader, setImagesLoader] = useState<Loader<Image[]>>({ type: "idle" });
    const projects = projectsLoader.type === "loaded" ? projectsLoader.data : noProjects;
    const images = imagesLoader.type === "loaded" ? imagesLoader.data : noImages;

    useEffect(() => {
        return initFuture(() => setProjectsLoader({ type: "loading" }))
            .flatMap(() => compositionRoot.images.getProjects())
            .run(
                projects => {
                    setProjectsLoader({ type: "loaded", data: projects });
                },
                error => {
                    console.error(error);
                    snackbar.error(error);
                    setProjectsLoader({ type: "error", error });
                }
            );
    }, [compositionRoot, snackbar]);

    useEffect(() => {
        if (projectInput.value) {
            return initFuture(() => setImagesLoader({ type: "loading" }))
                .flatMap(() => compositionRoot.images.get(projectInput.value))
                .run(
                    images => {
                        setImagesLoader({ type: "loaded", data: images });
                    },
                    error => {
                        console.error(error);
                        snackbar.error(error);
                        setImagesLoader({ type: "error", error });
                    }
                );
        }
    }, [compositionRoot, projectInput.value, snackbar]);

    const projectOptions = projects.map(project => ({
        value: project.name,
        label: project.name,
    }));

    const imageOptions = images.map(image => ({
        value: image.id,
        label: `${image.name} (${image.dhis2Version})`,
    }));

    useEffect(() => {
        imageInputOnChange(_.first(images));
    }, [images, imageInputOnChange]);

    const onChange = useCallback<NonNullable<SingleSelectFieldProps["onChange"]>>(
        ({ selected }, ev) => {
            const project = projects.find(project => project.name === selected);

            if (project && projectInput.onChange) {
                projectInput.onChange(project.name, ev);
                imageInput.onChange(undefined);
            }
        },
        [projects, projectInput, imageInput]
    );

    const onChangeOptionCombo = useCallback(
        ({ selected }) => {
            const selectedImage = images.find(image => image.id === selected);

            if (selectedImage) {
                imageInput.onChange(selectedImage);
            }
        },
        [imageInput, images]
    );

    const isProjectsLoading = projectsLoader.type === "loading";
    const isArtifactsLoading = imagesLoader.type === "loading";
    const someProjectSelected = _(projects).some(project => project.name === projectInput.value);

    const isValidProject = _(projectOptions).some(option => option.value === projectInput.value);
    const projectSelected = isValidProject ? projectInput.value : undefined;

    return (
        <React.Fragment>
            <SingleSelectField
                disabled={disabled}
                onChange={onChange}
                selected={projectSelected}
                loading={isProjectsLoading}
            >
                {projectOptions.map(({ value, label }) => (
                    <SingleSelectOption value={value} label={label} key={value} />
                ))}
            </SingleSelectField>

            {someProjectSelected && (
                <React.Fragment>
                    <Row>{getContainerFieldName("image")}</Row>

                    <SingleSelectField
                        disabled={disabled}
                        onChange={onChangeOptionCombo}
                        selected={imageInput.value.id}
                        loading={isArtifactsLoading}
                    >
                        {imageOptions.map(({ value, label }) => (
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
