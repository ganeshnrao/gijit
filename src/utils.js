const exec = require("util").promisify(require("child_process").exec);

const issueKeyRegex = /\w+-\d+/gi;

module.exports = {
  async run(cmd) {
    const { stdout, stderr } = await exec(cmd);
    if (stderr) {
      console.log(stderr);
      throw new Error(stderr);
    }
    return stdout;
  },

  branchNameToIssueKey(branchName) {
    const matches = branchName.match(issueKeyRegex);
    return matches ? matches[0] : null;
  },

  isValidIssueKey(issueKey) {
    return issueKeyRegex.test(issueKey);
  },

  execute(fn) {
    fn().catch(error => console.error(error.stack) || process.exit(1));
  }
};
