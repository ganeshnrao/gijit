const getApi = require("./getApi");
const _ = require("lodash");
const renderDetailed = require("./renderDetailed");
const git = require("./git");

async function detailedView(issueKey) {
  if (_.isEmpty(issueKey)) {
    return;
  }
  const api = await getApi();
  const { issues } = await api.searchJira(`key=${issueKey}`);
  _.each(issues, issue => _.each(renderDetailed, render => render(issue)));
}

async function getCurrentBranchKey() {
  const branches = await git.getCurrentBranch();
  const current = branches.pop();
  return current.issueKey;
}

async function main() {
  const issueKey = process.argv[2] || (await getCurrentBranchKey());
  await detailedView(issueKey);
}

main().catch(error => console.error(error.stack) || process.exit(1));
