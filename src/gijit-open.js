const program = require("commander");
const getApi = require("./getApi");
const { execute, run, getIssueKeyFromArgOrBranch } = require("./utils");

async function main() {
  const [key] = program.parse(process.argv).args;
  const issueKey = await getIssueKeyFromArgOrBranch(key);
  const api = await getApi();
  const url = `${api.protocol}://${api.host}/browse/${issueKey}`;
  console.log(`Opening ${url}`);
  return run(`open ${url}`);
}

execute(main);
