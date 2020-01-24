const core = require('@actions/core');
const github = require('@actions/github');
const request = require('request-promise-native');
const dateFormat = require('dateformat');

let build =
    {
        schemaVersion: "1.0",
        pipelineId: "",
        buildNumber: null,
        updateSequenceNumber: null,
        displayName: "" ,
        url: "",
        state: "",
        lastUpdated: "",
        issueKeys: [],
        testInfo: {},
        testInfo: {
            totalNumber: 6,
            numberPassed: 1,
            numberFailed: 3,
            numberSkipped: 2
        },
        references: []
    };

let buildRef =
    {
        commit: {
            id: "",
            repositoryUri: ""
        },
        ref: {
            name: "buildRef",
            uri: ""
        }
    };

let bodyData =
    {
        builds: []
    };

let options = {
    method: 'POST',
    url: '',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        Authorization: ''
    },
    body: {}
};

async function submitBuildInfo() {
    try {
        const cloudId = core.getInput('cloud-id');
        const accessToken = core.getInput('access-token');
        const pipelineId = core.getInput('pipeline-id');
        const buildNumber = core.getInput('build-number');
        const buildDisplayName = core.getInput('build-display-name');
        const buildState = core.getInput('build-state');
        const buildUrl = core.getInput('build-url');
        const updateSequenceNumber = core.getInput('update-sequence-number');
        let lastUpdated = core.getInput('last-updated');
        const issueKeys = core.getInput('issue-keys');
        const commitId = core.getInput('commit-id');
        const repoUrl = core.getInput('repo-url');
        const buildRefUrl = core.getInput('build-ref-url');

        console.log("lastUpdated: " + lastUpdated);
        lastUpdated = dateFormat(lastUpdated, "yyyy-mm-dd'T'HH:MM:ss'Z'");
        console.log("formatted lastUpdated: " + lastUpdated);
        buildRef.commit.id = commitId;
        buildRef.commit.repositoryUri = buildRefUrl;
        buildRef.ref.uri = buildRefUrl;

        build.pipelineId = pipelineId;
        build.buildNumber = buildNumber;
        build.updateSequenceNumber = updateSequenceNumber;
        build.displayName = buildDisplayName;
        build.url = buildUrl;
        build.state = buildState;
        build.lastUpdated = lastUpdated;
        build.issueKeys = issueKeys.split(',');
        build.references = [buildRef];

        bodyData.builds = [build];
        bodyData = JSON.stringify(bodyData);
        console.log("bodyData: " + bodyData);

        options.body = bodyData;
        options.url = "https://api.atlassian.com/jira/builds/0.1/cloud/" + cloudId + "/bulk";
        options.headers.Authorization = "Bearer " + accessToken;

        console.log("options: ", options);

        // const payload = JSON.stringify(github.context.payload, undefined, 2)
        // console.log(`The event payload: ${payload}`);

        let response = await request(options);
        response = JSON.parse(response);
        console.log("response: ", response);
        if(response.rejectedBuilds && response.rejectedBuilds.length > 0) {
            const rejectedBuild = response.rejectedBuilds[0];
            console.log("errors: ", rejectedBuild.errors);
            let errors = rejectedBuild.errors.map(error => error.message).join(',');
            errors.substr(0, errors.length - 1);
            console.log("joined errors: ", errors);
            core.setFailed(errors);
        }
        core.setOutput("response", response);
    } catch (error) {
        core.setFailed(error.message);
    }
}


(async function () {
    await submitBuildInfo();
    console.log("finished submiting build info");
})();
