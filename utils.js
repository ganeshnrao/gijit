'use strict'

const _ = require('lodash')
const read = require('util').promisify(require('read'))
const config = require('./config')
const chalk = require('chalk')

const { fields, ops } = config

const inferColumnWidths = (columns, separator) => {
  const numColumns = _.size(columns)
  const separatorWidth = separator.length * (numColumns - 1)
  const { setWidth, colsToSet } = _.reduce(columns, (acc, c, key) => {
    if (_.isNumber(c)) {
      acc.setWidth += c
      columns[key] = { width: c }
    } else if (_.isString(c)) {
      acc.colsToSet[key] = columns[key] = { width: '*' }
    } else if (_.isObject(c)) {
      if (_.isNumber(c.width)) {
        acc.setWidth += c.width
      } else {
        acc.colsToSet[key] = c
      }
    }
    return acc
  }, { setWidth: 0, colsToSet: {} })
  const availableWidth = process.stdout.columns - setWidth - separatorWidth
  const avgWidth = availableWidth / _.size(colsToSet)
  _.each(colsToSet, column => {
    column.width = avgWidth
  })
}

const truncateString = (value, width) => {
  if (value.length > width) {
    return `${value.slice(0, width - 1)}…`
  }
  return value
}

const logRow = (data, columns, separator) => {
  inferColumnWidths(columns, separator)
  console.log(_.map(columns, ({ width, align, truncate = true, formatter = _.identity }, key) => {
    const rawValue = formatter(String(_.isUndefined(data[key]) ? '' : data[key]))
    const value = (truncate ? truncateString : _.identity)(rawValue, width)
    switch (align) {
      case 'right':
        return _.padStart(value, width)
      case 'center':
        return _.padEnd(Array((width - value.length) / 2).join(' ') + value, width)
      default:
        return _.padEnd(value, width)
    }
  }).join(separator))
}

const utils = {
  read,
  ops,

  wrapQuotes(value) {
    return value.indexOf(' ') > -1 ? `"${value}"` : value
  },

  wrapBrackets(value) {
    return value ? `(${value})` : value
  },

  log(result, options) {
    if (_.size(result.issues)) {
      if (options.detailed) {
        return _.each(result.issues, issue => utils.detailed(issue))
      }
      const keyWidth = _.reduce(result.issues, (acc, { key }) => Math.max(key.length, acc), 0)
      _.each(result.issues, (issue, index) => utils.line({
        issue,
        index: result.startAt + index,
        columns: {
          index: { width: String(result.total).length, align: 'right' },
          key: { width: keyWidth },
          summary: '*',
          status: 12,
          assignee: { width: 12, formatter: utils.formatName },
          priority: 10
        }
      }))
    }
  },

  detailed(issue) {
    console.log()
    _.each(fields, (path, key) =>
      console.log(`${chalk.blue(_.padStart(_.upperFirst(key), 12))} ${_.get(issue, path, 'N/A')}`))
    console.log()
  },

  line({ issue, index, columns, separator = '  ' }) {
    const data = _.reduce(columns, (acc, c, key) => {
      if (fields[key]) {
        acc[key] = _.get(issue, fields[key]) || ''
      }
      return acc
    }, {})
    logRow({ ...data, index: index + 1 }, columns, separator)
  },

  formatName(displayName) {
    if (displayName) {
      const [first, last = ''] = String(displayName).split(' ')
      return `${first} ${last.slice(0, 1)}`
    }
    return displayName
  },

  handle(fn) {
    return function () {
      fn(...Array.from(arguments).reverse())
        .then(result => {
          const warningMessages = _.get(result, 'warningMessages')
          if (warningMessages) {
            console.warn(`\nWarnings: \n${warningMessages.join('\n')}`)
          }
        })
        .catch(error => {
          console.error(_.get(error, 'error.errorMessages', []).join('\n') || error.stack)
          process.exit(1)
        })
    }
  },

  $and(array) {
    return array.length > 1
      ? `(${array.join(ops.and)})`
      : _.first(array)
  },

  $or(array) {
    return array.length > 1
      ? `(${array.join(ops.or)})`
      : _.first(array)
  }
}

module.exports = utils
