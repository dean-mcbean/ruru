const axios = require("axios");
const { GITHUB, URLS } = require("../../constants");

async function downloadArtifact(workflow_run_id, artifact_name, repo) {
  setTimeout(async () => {
    const owner = GITHUB.OWNER;

    const headers = {
      Authorization: `token ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
    };

    // Get the list of artifacts for the workflow run
    const artifactsUrl = `${URLS.githubApi}/repos/${owner}/${repo}/actions/runs/${workflow_run_id}/artifacts`;
    const artifactsResponse = await axios.get(artifactsUrl, { headers });

    console.log(
      workflow_run_id,
      artifact_name,
      artifactsResponse.data,
      artifactsUrl,
    );

    if (artifactsResponse.data.total_count === 0) {
      console.log(`No artifacts found for workflow run ${workflow_run_id}.`);
      return;
    }

    // Find the artifact with the given name
    // Actually just get the first artifact
    const artifact = artifactsResponse.data.artifacts[0];

    if (!artifact) {
      console.log(`Artifact "${artifact_name}" not found.`);
      return;
    }

    // Download the artifact
    const downloadUrl = `${URLS.githubApi}/repos/${owner}/${repo}/actions/artifacts/${artifact.id}/zip`;
    const downloadResponse = await axios.get(downloadUrl, {
      headers,
      responseType: "arraybuffer",
    });

    // Save the artifact to a file
    const fs = require("fs");
    fs.writeFileSync(`./public/${artifact_name}.zip`, downloadResponse.data);

    //Delete the existing directory
    fs.rmdirSync(`./public/hosted/${artifact_name}`, { recursive: true });

    // Unzip the artifact
    const unzipper = require("unzipper");
    const stream = require("stream");
    const unzipStream = stream.PassThrough();
    unzipStream.end(downloadResponse.data);
    unzipStream.pipe(
      unzipper.Extract({ path: `./public/hosted/${artifact_name}` }),
    );
  }, 10000);
}

module.exports = { downloadArtifact };
