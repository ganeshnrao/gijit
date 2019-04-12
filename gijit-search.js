const _ = require("lodash");
const getApi = require("./getApi");
const chalk = require("chalk");

const query = process.argv[2];

function get(issue, path, defaultValue = "N/A") {
  const value = _.get(issue, path);
  return _.isNil(value) ? defaultValue : value;
}

const fieldMap = {
  key(issue) {
    return chalk.bold(get(issue, "key"));
  },
  summary(issue) {
    return get(issue, "fields.summary");
  },
  status(issue) {
    return chalk.gray(get(issue, "fields.status.name"));
  },
  issuetype(issue) {
    return chalk.cyan(get(issue, "fields.issuetype.name"));
  },
  assignee(issue) {
    return chalk.blue(get(issue, "fields.assignee.key"));
  },
  reporter(issue) {
    return chalk.cyan(get(issue, "fields.reporter.key"));
  },
  created(issue) {
    return get(issue, "fields.created").slice(0, 10);
  }
};

async function main() {
  if (_.isEmpty(query)) return;
  const api = await getApi();
  const fields = ["key", "issuetype", "summary", "status", "assignee"];
  const { issues } = await api.searchJira(process.argv[2], { fields });
  _.each(issues, issue => {
    const row = _.reduce(
      fields,
      (acc, field) => {
        if (fieldMap[field]) {
          acc.push(fieldMap[field](issue));
        }
        return acc;
      },
      []
    );
    console.log(row.join(" "));
  });
}

main().catch(error => console.error(error.stack) || process.exit(1));
