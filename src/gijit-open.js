const program = require("commander");
const getApi = require("./getApi");
const { execute, run } = require("./utils");

async function main() {
  const [issueKey] = program.parse(process.argv).args;
  const api = await getApi();
  const url = `${api.protocol}://${api.host}/browse/${issueKey}`;
  console.log(`Opening ${url}`);
  return run(`open ${url}`);
}

execute(main);
