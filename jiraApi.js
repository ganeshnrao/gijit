'use strict'

const JiraClient = require('jira-client')

const jiraApi = {
  init(host, username, password) {
    jiraApi.client = new JiraClient({ protocol: 'https', apiVersion: '2', strictSSL: true, host, username, password });
  }
}

module.exports = jiraApi
