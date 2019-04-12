'use strict'

const program = require('commander')
const _ = require('lodash')
const utils = require('./utils')
const shared = require('./shared')

const makeQueryString = (queryKey, value, operator = '=') => {
  const key = utils.wrapQuotes(queryKey)
  if (value.indexOf('!') === 0) {
    return `${key}!=${utils.wrapQuotes(value.replace('!', ''))}`
  }
  return `${key}${operator}${utils.wrapQuotes(value)}`
}

const getQueryItem = (queryKey, value, operator) => {
  if (_.isUndefined(value) || value === '') {
    return undefined
  }
  if (value.indexOf('|') > -1) {
    const items = value.split('|').map(i => i.trim())
    return utils.$or(_.map(items, i => makeQueryString(queryKey, i, operator)))
  }
  if (value.indexOf(',') > -1) {
    const items = value.split(',').map(i => i.trim())
    return utils.$and(_.map(items, i => makeQueryString(queryKey, i, operator)))
  }
  return makeQueryString(queryKey, value, operator)
}

const buildQuery = (options, cmd) => {
  const optionSettings = {
    epicLink: 'Epic Link',
    assignee: 'assignee',
    reporter: 'reporter',
    creator: 'creator',
    status: 'status',
    priority: 'priority',
    sprint: 'Sprint',
    type: 'type',
    labels: 'labels',
    text: { queryKey: 'text', defaultOperator: '~' },
    resolution: 'resolution'
  }
  const queryItems = _.reduce(optionSettings, (acc, settings, optionName) => {
    const optionValue = _.get(options, optionName)
    if (optionValue) {
      const { queryKey, defaultOperator = '=' } = _.isString(settings) ? { queryKey: settings } : settings
      acc.push(getQueryItem(queryKey, optionValue, defaultOperator))
    }
    return acc
  }, [])
  return utils.$and(_.compact([utils.$and(queryItems), utils.wrapBrackets(cmd)]))
}

const search = async (options, cmd) => {
  const query = options.queryCached || buildQuery(options, cmd)
  if (!options.queryCached) {
    console.info(`Query: ${query}`)
    options.queryCached = query
  }
  const result = await shared.searchQuery(query, options)
  utils.log(result, options)
  if (await shared.loadNextPage(result, options)) {
    return search(options, cmd)
  }
}

program
  .option('-e --epicLink <issueKey>', 'filter by epic links e.g. ')
  .option('-a --assignee <assigneeName>', 'filter by assignee')
  .option('-r --reporter <assigneeName>', 'filter by reporter')
  .option('-c --creator <assigneeName>', 'filter by creator')
  .option('-s --status <statusName>', 'filter by status')
  .option('-p --priotity <priorityName>', 'filter by priority')
  .option('-n --sprint <sprintName>', 'filter by sprint')
  .option('-t --type <typeName>', 'filter by type')
  .option('-l --label <labels>', 'filter by labels', labels => labels.split(',').map(i => i.trim()))
  .option('-x --text <searchText>', 'search for text')
  .option('-u --resolution <resolutionName>', 'filter by resolution')
  .option('-m --maxResults <maxResults>', 'set max results to show')
  .option('-i --startAt <startAt>', 'show results starting at')
  .action(utils.handle(search))
  .parse(process.argv)
