const _ = require("lodash");
const program = require("commander");
const getApi = require("./getApi");
const { run, execute, branchNameToIssueKey } = require("./utils");
const { fields, getDetailTable } = require("./renderer");

async function getKeyArg() {
  const [key] = program.parse(process.argv).args;
  if (key) {
    return key;
  }
  const branchName = await run("git rev-parse --abbrev-ref HEAD");
  return branchNameToIssueKey(branchName);
}

async function main() {
  const key = await getKeyArg();
  const api = await getApi();
  const query = `key=${key}`;
  const { issues } = await api.searchJira(query, { fields: _.keys(fields) });
  console.log(getDetailTable(issues).toString());
}

execute(main);
