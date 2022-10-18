export const appConfig: AppConfig = {
    appKey: "d2-docker-app",
    appearance: {
        showShareButton: true,
    },
    feedback: {
        createIssue: false,
        sendToDhis2UserGroups: [],
        clickUp: {
            apiUrl: "https://dev.eyeseetea.com/clickup",
            listId: "168819678",
            title: "[User feedback] {title}",
            body: "## dhis2\n\nUsername: {username}\n\n{body}",
            status: "Misc"
        },
        feedbackOptions: {
            showContact: false,
            descriptionTemplate: "## Summary\n\n## Steps to reproduce\n\n## Actual results\n\n## Expected results\n\n"
        }
    },
};

export interface AppConfig {
    appKey: string;
    appearance: {
        showShareButton: boolean;
    };
    feedback?: {
        createIssue: boolean;
        sendToDhis2UserGroups: string[];
        clickUp: object,
        feedbackOptions: object;
    };
}
