import React from "react";
import { Maybe } from "../../../types/utils";

export interface LinkProps {
    name: string;
    url: Maybe<string>;
    tooltip?: string;
}

export const Link: React.FC<LinkProps> = React.memo(props => {
    const { name, url, tooltip } = props;

    if (url) {
        return (
            <a href={url} target="_blank" rel="noreferrer" title={tooltip}>
                {name}
            </a>
        );
    } else {
        return <span>{name}</span>;
    }
});
