#!/usr/bin/env node

'use strict'

const _ = require('lodash')
const { exec } = require('child_process')
const Promise = require('bluebird')
const path = require('path')
const homedir = require('os').homedir()
const fs = require('fs')
const read = require('util').promisify(require('read'))
const jiraApi = require('./jiraApi')
const args = require('yargs')
  .options({
    allBranches: { alias: 'a', type: 'boolean', description: 'Show info for all branches in current git' },
    issueKey: { alias: 'i', type: 'string', description: 'Show info for one JIRA issue' }
  })
  .showHelpOnFail(true)
  .help()
  .argv

const configFilePath = path.resolve(homedir, 'gijit.config.js')
const paths = {
  summary: 'fields.summary',
  status: 'fields.status.name',
  assignee: 'fields.assignee.displayName',
  project: 'fields.project.name',
  priority: 'fields.priority.name'
}

const initialize = async (isReattempt) => {
  if (!isReattempt) console.log(`Setup Gijit\nThis will create a file ${configFilePath}`)
  const host = await read({ prompt: 'host (e.g. myteam.atlassian.net)' })
  const username = await read({ prompt: 'username' })
  const password = await read({ prompt: 'password', silent: true })
  if (host && username && password) {
    fs.writeFileSync(configFilePath, `module.exports=${JSON.stringify({ host, username, password })}`)
    console.log(`Successfully created ${configFilePath}`)
    return { host, username, password }
  } else {
    console.error('Invalid credentials, please try again')
    return initialize(true)
  }
}

const loadSettings = async () => {
  try {
    return require(configFilePath)
  } catch (error) {
    return initialize()
  }
}

const runCommand = async cmd => new Promise((resolve, reject) =>
  exec(cmd, (error, stdout) => error ? reject(error) : resolve(stdout)))

const columnLeft = (string, width, padFn = _.padEnd) =>
  string.length > width
    ? padFn(`${string.slice(0, width - 1)}…`, width)
    : padFn(string, width)

const logIssue = (issue, branchName) => {
  const { summary, status, assignee, priority } = _.mapValues(paths, p => _.get(issue, p, 'N/A'))
  const key = _.get(issue, 'key', branchName)
  const idLength = _.size(branchName || key)
  const separator = '  '
  const statusLength = 12
  const assigneeLength = 12
  const priorityLength = 10
  const sepLength = 4 * separator.length
  const summarylength = process.stdout.columns - idLength - statusLength - assigneeLength - priorityLength - sepLength
  console.log([
    branchName || key,
    columnLeft(summary, summarylength),
    columnLeft(status, statusLength),
    columnLeft(assignee, assigneeLength),
    columnLeft(priority, priorityLength)
  ].join(separator))
}

const logError = (error, prefix = '') => {
  const message = _.get(error, 'error.errorMessages', []).join('\n') || error.stack
  console.error(`${prefix}${prefix ? ' ' : ''}{ error } ${message}`)
}

const fetchIssue = issueKey => {
  const matches = issueKey.match(/(\w+-)*(\d{1,})/)
  if (matches) {
    const [, issueTag, issueNumber] = matches
    if (issueTag && issueNumber) {
      return jiraApi.client.findIssue(`${issueTag}${issueNumber}`, '', _.keys(paths).join())
    }
  }
}

const showIssue = async (issueKey, branchName) => {
  try {
    logIssue(await fetchIssue(issueKey), branchName)
  } catch (error) {
    logError(error, branchName || issueKey)
  }
}

const showAllBranches = async () => {
  const branchNames = await runCommand('git branch')
  let maxBranchNameLength = 0
  const branchData = _.reduce(branchNames.split('\n'), (acc, branch) => {
    const branchName = branch.trim()
    const issueKey = branch.replace(/\*/, '').trim()
    maxBranchNameLength = Math.max(maxBranchNameLength, branchName.length)
    if (issueKey.length) acc.push({ issueKey, branchName })
    return acc
  }, [])
  return Promise.map(
    branchData,
    ({ issueKey, branchName }) => showIssue(issueKey, _.padEnd(branchName, maxBranchNameLength)),
    { concurrency: 10 }
  )
}

const showCurrentBranch = async () => showIssue(await runCommand('git rev-parse --abbrev-ref HEAD'))

const main = async () => {
  const { host, username, password } = await loadSettings()
  jiraApi.init(host, username, password)
  if (args.issueKey) return showIssue(args.issueKey)
  if (args.allBranches) return showAllBranches()
  return showCurrentBranch()
}

main()
  .catch(error => console.error(error) && process.exit(1))
