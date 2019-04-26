const _ = require("lodash");
const program = require("commander");
const getApi = require("./getApi");
const { execute, getKeyArg } = require("./utils");
const { fields, getDetailTable } = require("./renderer");

async function main() {
  const [key] = program.parse(process.argv).args;
  const issueKey = await getKeyArg(key);
  const api = await getApi();
  const query = `key=${issueKey}`;
  const { issues } = await api.searchJira(query, { fields: _.keys(fields) });
  console.log(getDetailTable(issues).toString());
}

execute(main);
