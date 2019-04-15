const _ = require("lodash");
const { run, branchNameToIssueKey, execute } = require("./utils");
const getApi = require("./getApi");
const { fields, getLineTable } = require("./renderer");

async function getAllBranches() {
  const branches = await run("git branch");
  return _.reduce(
    branches.trim().split(/\n+/),
    (acc, branchName) => {
      const isCurrent = branchName.indexOf("*") > -1;
      const branch = branchName.replace("*", "").replace(/\s+/, "");
      const issueKey = branchNameToIssueKey(branch);
      const branchItem = { branch, issueKey, isCurrent };
      acc.branches.push(branchItem);
      if (issueKey) {
        acc.branchByIssueKey[issueKey] = acc.branchByIssueKey[issueKey] || [];
        acc.branchByIssueKey[issueKey].push(branchItem);
      }
      return acc;
    },
    { branches: [], branchByIssueKey: {} }
  );
}

async function main() {
  const api = await getApi();
  const { branches, branchByIssueKey } = await getAllBranches();
  if (_.size(branchByIssueKey)) {
    const query = _.keys(branchByIssueKey)
      .map(key => `key=${key}`)
      .join(" or ");
    const { issues } = await api.searchJira(query, { fields: _.keys(fields) });
    _.each(issues, issue => {
      _.each(branchByIssueKey[issue.key], item => {
        item.issue = _.clone(issue);
      });
    });
  }
  _.each(branches, branchItem => {
    const { branch, issue, isCurrent } = branchItem;
    const suffix = isCurrent ? " *" : "";
    if (issue) {
      issue.key = `${branch}${suffix}`;
    } else {
      branchItem.issue = { key: `${branch}${suffix}` };
    }
  });
  console.log(getLineTable(_.map(branches, "issue")).toString());
}

execute(main);
