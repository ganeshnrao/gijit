const program = require("commander");
const getApi = require("./getApi");
const { execute } = require("./utils");
const { getLineTable } = require("./renderer");

async function main() {
  const [username] = program.parse(process.argv).args;
  const api = await getApi();
  const options = {
    includeInactive: true,
    includeActive: true
  };
  if (username) {
    options.username = username;
  }
  const users = await api.searchUsers(options);
  const fields = [
    "key",
    "user/displayName",
    "user/emailAddress",
    "user/status"
  ];
  console.log(getLineTable(users, fields).toString());
}

execute(main);
