const _ = require("lodash");
const chalk = require("chalk");
const wrap = require("word-wrap");

function getValue(issue, path, defaultValue = "N/A") {
  const value = _.get(issue, path);
  return _.isNil(value) ? defaultValue : value;
}

let maxLabelWidth = 12;

function renderField(label, value, separator = " ") {
  if (label) {
    const labelPadded = _.padStart(label, maxLabelWidth + 1);
    return console.log(`${chalk.blue(labelPadded)}${separator}${value}`);
  }
  console.log(value);
}

function detailed(label, path) {
  return function(issue) {
    renderField(label, getValue(issue, path));
  };
}

function userDetail(issue, field) {
  const displayName = getValue(issue, `fields.${field}.displayName`);
  const emailAddress = getValue(issue, `fields.${field}.emailAddress`, "");
  return `${displayName} ${chalk.gray(emailAddress)}`;
}

module.exports = {
  key: detailed("Key", "key"),

  summary(issue) {
    renderField("Summary", chalk.white(getValue(issue, "fields.summary")));
  },

  status: detailed("Status", "fields.status.name"),

  labels(issue) {
    renderField("Labels", getValue(issue, "fields.labels").join(" | "));
  },

  created(issue) {
    renderField("Created", getValue(issue, "fields.created"));
  },

  updated(issue) {
    renderField("Updated", getValue(issue, "fields.updated"));
  },

  creator(issue) {
    renderField("Creator", userDetail(issue, "creator"));
  },

  reporter(issue) {
    renderField("Reporter", userDetail(issue, "reporter"));
  },

  assignee(issue) {
    renderField("Assignee", userDetail(issue, "assignee"));
  },

  issuetype: detailed("Type", "fields.issuetype.name"),

  project: detailed("Project", "fields.project.name"),

  description(issue) {
    const description = getValue(issue, "fields.description");
    renderField(
      "Description",
      wrap(description, {
        width: 80,
        indent: _.pad("", maxLabelWidth + 2)
      }).trim()
    );
  }
};
