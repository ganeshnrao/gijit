"use strict";

const _ = require("lodash");
const exec = require("util").promisify(require("child_process").exec);

const issueKeyRegex = /^(\w+-)*(\d{1,})/i;

const run = async cmd => {
  const { stdout, stderr } = await exec(cmd);
  if (stderr) {
    throw new Error(stderr);
  }
  return stdout;
};

const getIssueKeyFromBranchName = name => {
  const matches = name.match(issueKeyRegex);
  if (matches) {
    const [, tag, id] = matches;
    return `${tag}${id}`;
  }
};

const git = {
  linesToBranches(lines = "") {
    return _.reduce(
      lines.split("\n"),
      (acc, line) => {
        if (line.trim().length) {
          const current = line.indexOf("*") > -1;
          const name = line.replace("*", "").trim();
          const issueKey = getIssueKeyFromBranchName(name);
          acc.push({ name, current, issueKey });
        }
        return acc;
      },
      []
    );
  },

  async getCurrentBranch() {
    return git.linesToBranches(await run("git rev-parse --abbrev-ref HEAD"));
  },

  async getAllBranches() {
    return git.linesToBranches(await run("git branch"));
  }
};

module.exports = git;
