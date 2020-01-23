const core = require('@actions/core');
const github = require('@actions/github');
let request = require('request-promise-native');


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
        references: [

        ]
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
        const lastUpdated = core.getInput('last-updated');
        const issueKeys = core.getInput('issue-keys');
        const commitId = core.getInput('commit-id');
        const repoUrl = core.getInput('repo-url');
        const buildRefUrl = core.getInput('build-ref-url');

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
        options.body = bodyData;


        options.url = "https://api.atlassian.com/jira/builds/0.1/cloud/" + cloudId + "/bulk";
        options.headers.Authorization = "Bearer " + accessToken;

        console.log("options: ", options);

        // const payload = JSON.stringify(github.context.payload, undefined, 2)
        // console.log(`The event payload: ${payload}`);

        const response = await request(options);
        console.log("response: ", response);
        core.setOutput("response", JSON.parse(response));
    } catch (error) {
        core.setFailed(error.message);
    }
}


(async function () {
    await submitBuildInfo();
    console.log("finished submiting build info");
})();
