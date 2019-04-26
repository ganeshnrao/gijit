const _ = require("lodash");
const chalk = require("chalk");
const Table = require("cli-table");
const config = require("./config");
const wrap = require("word-wrap");

const wrapSettings = { width: 80, indent: "" };

function get(issue, path, defaultValue = "-") {
  const value = _.get(issue, path);
  return _.isNil(value) ? defaultValue : value;
}

function getTable(options) {
  return new Table({
    style: {
      head: [config.colors ? "red" : "reset"],
      border: [config.colors ? "dim" : "reset"]
    },
    ...options
  });
}

function detailWrapFn(value) {
  return wrap(value, wrapSettings);
}

const fields = {
  id: {
    path: "id",
    title: "ID",
    color: "yellow"
  },
  name: {
    path: "name",
    title: "Name"
  },
  key: {
    path: "key",
    color: "bold",
    title: "Key"
  },
  summary: {
    path: "fields.summary",
    title: "Summary",
    detailWrapFn
  },
  issuetype: {
    path: "fields.issuetype.name",
    color: "cyan",
    title: "Type"
  },
  priority: {
    path: "fields.priority.name",
    color: "red",
    title: "Priority"
  },
  status: {
    path: "fields.status.name",
    color: "gray",
    title: "Status"
  },
  project: {
    path: "fields.project.name",
    title: "Project"
  },
  environment: {
    path: "fields.environment",
    title: "Environment"
  },
  assignee: {
    path: "fields.assignee.key",
    color: "blue",
    title: "Assignee"
  },
  reporter: {
    path: "fields.reporter.key",
    color: "blue",
    title: "Reporter"
  },
  creator: {
    path: "fields.creator.key",
    color: "blue",
    title: "Creator"
  },
  updated: {
    path: "fields.updated",
    color: "gray",
    title: "Updated"
  },
  created: {
    path: "fields.created",
    color: "gray",
    title: "Created"
  },
  labels: {
    path: "fields.labels",
    color: "yellow",
    title: "Labels",
    transform(labels) {
      return _.isArray(labels) ? labels.join(" · ") : labels;
    }
  },
  description: {
    path: "fields.description",
    title: "Description",
    detailWrapFn,
    transform(description) {
      return description.replace(/\r/g, "");
    }
  },
  comment: {
    path: "fields.comment",
    title: "Comments",
    transform(comment) {
      return _.map(comment.comments, comment => {
        const author = chalk.bold(_.get(comment, "author.name", ""));
        const commentId = chalk.yellow(comment.id);
        const updated = chalk.dim(comment.updated);
        const body = comment.body.replace(/\r/g, "");
        const commentString = `${author} ${commentId} ${updated}\n${body}`;
        return detailWrapFn(commentString);
      }).join("\n\n");
    }
  },
  "project/boards": {
    path: "boards",
    title: "Boards",
    transform(boards) {
      return _.map(boards, ({ id, name }) => {
        const idColor = getColorFn("id");
        const nameColor = getColorFn("name");
        return `${idColor(id)} ${nameColor(name)}`;
      }).join("\n");
    }
  },
  "user/displayName": {
    path: "displayName",
    title: "Display Name"
  },
  "user/emailAddress": {
    path: "emailAddress",
    title: "Email Address"
  },
  "user/status": {
    path: "active",
    title: "Status",
    transform(active) {
      return active ? "Active" : "Inactive";
    }
  }
};

function getColorFn(fieldName, fallbackColor) {
  if (!config.colors) {
    return _.identity;
  }
  const configColor = _.get(config, `fields.${fieldName}.color`);
  if (configColor) {
    if (!chalk[configColor]) {
      throw new Error(`Invalid chalk color name "${configColor}"`);
    }
    return chalk[configColor];
  }
  const field = fields[fieldName];
  const fallback = fallbackColor ? chalk[fallbackColor] : _.identity;
  return field.color ? chalk[field.color] : fallback;
}

function getWrapFn(fieldName) {
  const width = _.get(config, `fields.${fieldName}.width`);
  return width > 0
    ? value => wrap(value, { ...wrapSettings, width })
    : _.identity;
}

function getLineItem(issue, name) {
  const { path, transform, colorFn, lineWrapFn } = fields[name];
  const value = transform(get(issue, path), issue, fields[name]);
  return colorFn(lineWrapFn(value));
}

function getDetailItem(issue, name) {
  const { path, transform, colorFn, detailWrapFn } = fields[name];
  const value = transform(get(issue, path), issue, fields[name]);
  return colorFn(detailWrapFn(value));
}

_.each(fields, (field, name) => {
  field.name = name;
  field.transform = field.transform || _.identity;
  field.lineWrapFn = getWrapFn(name);
  field.detailWrapFn = field.detailWrapFn || _.identity;
  field.colorFn = getColorFn(name);
  field.line = issue => getLineItem(issue, name);
  field.detail = issue => getDetailItem(issue, name);
});

function getLineTable(issues, selectedFields = config.lineFields) {
  const lineFields = _.compact(_.map(selectedFields, name => fields[name]));
  const table = getTable({ head: _.map(lineFields, "title") });
  _.each(issues, issue => {
    const row = _.map(lineFields, field => field.line(issue));
    table.push(row);
  });
  return table;
}

function getDetailTable(issues, selectedFields = config.detailFields) {
  const table = getTable();
  const toShow = selectedFields ? _.pick(fields, selectedFields) : fields;
  _.each(issues, issue => {
    _.each(toShow, field => {
      table.push([field.title, field.detail(issue)]);
    });
  });
  return table;
}

module.exports = {
  fields,
  getTable,
  getLineTable,
  getLineItem,
  getDetailTable
};
