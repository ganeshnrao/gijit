const _ = require("lodash");
const fs = require("fs");
const path = require("path");
const os = require("os");

const configFilePath = path.resolve(os.homedir(), "gijit.config.js");

const configData = fs.existsSync(configFilePath)
  ? require(configFilePath)
  : { config: {} };

module.exports = _.defaultsDeep(configData.config, {
  colors: true,
  fields: {
    key: { color: "bold" },
    summary: { width: 80 },
    issuetype: { color: "cyan" },
    priority: { color: "magenta" },
    status: { color: "dim" },
    project: {},
    assignee: { color: "blue" },
    reporter: { color: "green" },
    creator: { color: "green" },
    created: { color: "dim" },
    updated: { color: "dim" },
    environment: { color: "dim" },
    labels: { color: "yellow", width: 30 },
    description: { width: 80 }
  },
  lineFields: [
    "key",
    "summary",
    "issuetype",
    "priority",
    "status",
    "assignee",
    "creator",
    "labels"
  ]
});
