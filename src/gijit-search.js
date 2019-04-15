const _ = require("lodash");
const program = require("commander");
const getApi = require("./getApi");
const { execute } = require("./utils");
const { fields, getLineTable } = require("./renderer");

async function main() {
  const [query] = program.parse(process.argv).args;
  const api = await getApi();
  const { issues } = await api.searchJira(query, { fields: _.keys(fields) });
  console.log(getLineTable(issues).toString());
}

execute(main);
