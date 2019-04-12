"use strict";

const _ = require("lodash");

const config = {
  fields: {
    key: "key",
    summary: "fields.summary",
    status: "fields.status.name",
    type: "fields.issuetype.name",
    assignee: "fields.assignee.displayName",
    reporter: "fields.reporter.displayName",
    creator: "fields.creator.displayName",
    project: "fields.project.name",
    priority: "fields.priority.name",
    description: "fields.description",
    createdOn: "fields."
  },
  ops: {
    and: " AND ",
    or: " OR "
  },
  getFields(detailed = false) {
    if (detailed) {
      return _.keys(
        _.reduce(config.fields, (acc, path) => _.set(acc, path, 1), {}).fields
      );
    }
    return ["summary", "status", "assignee", "priority"];
  }
};

module.exports = config;
