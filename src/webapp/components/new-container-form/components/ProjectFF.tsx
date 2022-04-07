import { SingleSelectField, SingleSelectOption } from "@dhis2/ui";
import _ from "lodash";
import React, { useCallback, useState, useEffect } from "react";
import { useField } from "react-final-form";
import styled from "styled-components";
import { useAppContext } from "../../../contexts/app-context";
import { getNewContainerFieldName } from "../NewContainerForm";
import { Project } from "../../../../data/repositories/ContainerD2DockerApiRepository";

export const ProjectFF: React.FC<CategoryOptionComboFFProps> = ({ input, dhis2DataArtifactField}) => {
    const { compositionRoot } = useAppContext();
    const { input: dhis2DataArtifactInput } = useField(dhis2DataArtifactField);
   const [dataElements, setDataElements] = useState<{value: string, label: string}[]>([]);
   const [artifactOptions, setArtifactOptions] = useState<{value: string, label: string}[]>([]);
  
   useEffect(() => {
    compositionRoot.container.listProjects().run(data => setDataElements(data.map((item: Project) => item.name).map((name:string) => ({value: name, label: name}))), error => console.log("error"));
    }, [compositionRoot, input]);

    useEffect(() => {
        if(input.value.id) {
            compositionRoot.container.listArtifacts(input.value.id).run((data: Artifact[])  => {
                const extractedData = _.flatten(data.filter((item: Artifact) => Boolean(item.tags)).map((nonNullItem: Artifact) => nonNullItem.tags)).map((tag:Tag) => ({value: tag.name, label: tag.name}));
                setArtifactOptions(extractedData)
                
            }, error => console.log("error"));
        }
    }, [compositionRoot, input.value.id]);

    useEffect(() => {
        dhis2DataArtifactInput.onChange(
            artifactOptions && artifactOptions[0] ? { id: artifactOptions[0].value, name: artifactOptions[0].label } : undefined
        );
    }, [artifactOptions]);    

        const onChangeDataElement = useCallback(
            ({ selected }) => {
                const dataElement = dataElements.find(item => item.value === selected);
                if (dataElement) {
                    input.onChange({ id: dataElement.value, name: dataElement.label });
                    dhis2DataArtifactInput.onChange(undefined);
                }
            },
            [dataElements, input]
        );

       const onChangeOptionCombo = useCallback(
            ({ selected }) => {
                const optionCombo = artifactOptions
                    .find(item => item.value === selected)
    
                if (optionCombo) {
                    dhis2DataArtifactInput.onChange({ id: optionCombo.value, name: optionCombo.label });
                }
            },
            [dhis2DataArtifactInput]
        );

    return (
        <React.Fragment>
            <SingleSelectField onChange={onChangeDataElement} selected={input.value.id}>
            {dataElements.map(({ value, label }) => (
                    <SingleSelectOption value={value} label={label} key={value} />
                ))}
            </SingleSelectField>
            {dataElements.find(({ value }) => value === input.value.id) && (
                <React.Fragment>
                    <Row>{getNewContainerFieldName("dhis2Data")}</Row>
                    <SingleSelectField onChange={onChangeOptionCombo} selected={dhis2DataArtifactInput.value.id}>
                        {artifactOptions.map(({ value, label }) => (
                            <SingleSelectOption value={value} label={label} key={value} />
                        ))}
                    </SingleSelectField>
                </React.Fragment>
            )}
        </React.Fragment>
    );
};

export interface CategoryOptionComboFFProps {
    input: any;
    dhis2DataArtifactField: string;
}
const Row = styled.div`
    margin: 20px 0;
`;
interface BuildHistory {
    absolute: boolean;
    href: string;
}
interface ExtraAttrs {
    architecture: string;
    author: string;
    config: Record<string, string[]>
    created: Date;
    os: string;
}
interface Tag {
 artifact_id: string;
 id: string;
 immutable: boolean;
 name: string;
 pull_time: Date;
 push_time: Date;
 repository_id: number;
 signed: boolean;
}
interface Artifact {
    additions_links: { build_history: BuildHistory };
    digest: string;
    extra_attrs: ExtraAttrs;
    icon: string;
    id: number;
    labels: string[] | null;
    manifest_media_type: string;
    media_type: string;
    project_id: number;
    pull_time: Date;
    push_time: Date;
    references: string[] | null;
    repository_id: number;
    size: number;
    tags: Tag[];
    type: string;

}