'use strict'

const _ = require('lodash')
const utils = require('./utils')
const getApi = require('./getApi')
const config = require('./config')

const getQueryForBranches = branches => {
  return utils.$or(_.reduce(branches, (acc, { issueKey }) => {
    if (issueKey) {
      acc.push(`key=${issueKey}`)
    }
    return acc
  }, []))
}

const loadNextPage = async (result, options) => {
  const { issues, total, startAt, maxResults } = result
  const numIssues = _.size(issues)
  const endAt = startAt + numIssues
  const hasMorePages = total - endAt > 0
  if (hasMorePages) {
    const showNext = await utils.read({ prompt: `[${startAt} - ${endAt}] of ${total}. Show next? (Y/N)` })
    if (showNext.toLowerCase().trim() === 'y') {
      options.startAt = startAt + maxResults
      return true
    }
  }
  return false
}

const replaceKeyWithBranchNames = (issues, branches) => {
  const branchByKey = _.reduce(branches, (acc, branch) => {
    acc[branch.issueKey] = branch
    return acc
  }, {})
  _.each(issues, issue => {
    const branch = branchByKey[issue.key]
    if (branch) {
      const { name, current } = branch
      issue.key = `${current ? '* ' : ''}${name}`
    }
  })
}

const shared = {
  async searchBranches(branches, options) {
    const query = options.queryCached || getQueryForBranches(branches)
    if (!options.queryCached) {
      options.queryCached = query
    }
    const result = await shared.searchQuery(query, options)
    replaceKeyWithBranchNames(result.issues, branches)
    utils.log(result, options)
    if (await shared.loadNextPage(result, options)) {
      return shared.searchBranches(branches, options)
    }
  },

  async searchQuery(query, options) {
    const { startAt = 0, maxResults = 50, detailed = false } = options
    const api = await getApi()
    const fields = config.getFields(detailed)
    console.log({ fields, startAt, maxResults });
    return api.searchJira(query, { fields, startAt, maxResults })
  },

  loadNextPage
}

module.exports = shared
