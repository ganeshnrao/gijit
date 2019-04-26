const yargs = require("yargs");
const getApi = require("./getApi");
const {
  execute,
  isValidIssueKey,
  getIssueKeyFromArgOrBranch
} = require("./utils");
const { getDetailTable } = require("./renderer");

const { issueKey: issueKeyInput, commentId, message } = yargs
  .usage("Add a new comment, or update existing comment")
  .options({
    issueKey: {
      alias: "i",
      description: "Jira issue key, e.g. DEV-1234"
    },
    commentId: {
      alias: "c",
      description: "Number of the comment to update, e.g. 1234"
    },
    message: {
      alias: "m",
      description: "Comment body"
    }
  })
  .check(args => {
    args.message = (args.message || "").trim();
    if (args.commentId && !args.message) {
      throw new Error("Message must be provided when commentId is provided");
    }
    if (args.issueKey && !isValidIssueKey(args.issueKey)) {
      throw new Error(`Invalid issue key ${args.issueKey}`);
    }
    return args;
  })
  .help()
  .showHelpOnFail(true).argv;

async function showComments(issueKey) {
  const api = await getApi();
  const fields = ["comment", "summary"];
  const { issues } = await api.searchJira(`key=${issueKey}`, { fields });
  console.log(getDetailTable(issues, ["key", "summary", "comment"]).toString());
}

async function main() {
  const api = await getApi();
  const issueKey = await getIssueKeyFromArgOrBranch(issueKeyInput);
  if (commentId) {
    await api.updateComment(issueKey, commentId, message);
  } else if (message) {
    await api.addComment(issueKey, message);
  }
  await showComments(issueKey);
}

execute(main);
