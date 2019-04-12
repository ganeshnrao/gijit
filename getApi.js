'use strict'

const JiraClient = require('jira-client')
const fs = require('fs')
const path = require('path')
const os = require('os')
const configFilePath = path.resolve(os.homedir(), 'gijit.config.js')
const utils = require("./utils")

const apiSettings = {
  protocol: 'https',
  apiVersion: 2,
  strictSSL: true
}

const setupConfig = async isReattempt => {
  if (!isReattempt) {
    console.log(`\nSetup Gijit\nThis will create a file ${configFilePath}`)
  }
  const host = await utils.read({ prompt: 'host (e.g. myteam.atlassian.net)' })
  const username = await utils.read({ prompt: 'username' })
  const password = await utils.read({ prompt: 'password', silent: true })
  if (host && username && password) {
    fs.writeFileSync(configFilePath, `module.exports=${JSON.stringify({ host, username, password })}`)
    console.log(`Successfully created ${configFilePath}`)
    return { host, username, password }
  } else {
    console.error('Invalid credentials, please try again')
    return setupConfig(true)
  }
}

const getJiraConfig = () => {
  try {
    return require(configFilePath)
  } catch (error) {
    console.log(`Config file does not exist ${configFilePath}`)
    return setupConfig()
  }
}

let api

const getApi = async () => {
  if (!api) {
    const { username, host, password } = await getJiraConfig()
    api = new JiraClient({ username, password, host, ...apiSettings });
  }
  return api
}

module.exports = getApi
