const JiraClient = require("jira-client");
const fs = require("fs");
const path = require("path");
const os = require("os");
const read = require("util").promisify(require("read"));

const configFilePath = path.resolve(os.homedir(), "gijit.config.js");

const apiSettings = {
  protocol: "https",
  apiVersion: 2,
  strictSSL: true
};

async function setupConfig(isReattempt) {
  if (!isReattempt) {
    console.log(
      `\nSetup Gijit\nThis will create a file ${configFilePath}. Please generate an API Token from https://id.atlassian.com/manage/api-tokens first and have it ready to be pasted in when prompted below.`
    );
  }
  const host = await read({ prompt: "host (e.g. myteam.atlassian.net)" });
  const username = await read({ prompt: "username" });
  const password = await read({ prompt: "API Token", silent: true });
  if (host && username && password) {
    const configData = { host, username, password, config: {} };
    fs.writeFileSync(
      configFilePath,
      `module.exports=${JSON.stringify(configData, null, "  ")}`
    );
    console.log(`Successfully created ${configFilePath}`);
    return configData;
  } else {
    console.error("Invalid credentials, please try again");
    return setupConfig(true);
  }
}

function getJiraConfig() {
  try {
    return require(configFilePath);
  } catch (error) {
    console.log(`Config file does not exist ${configFilePath}`);
    return setupConfig();
  }
}

let api;

async function getApi() {
  if (!api) {
    const { username, host, password } = await getJiraConfig();
    api = new JiraClient({ username, password, host, ...apiSettings });
  }
  return api;
}

module.exports = getApi;
