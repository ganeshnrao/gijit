'use strict'

const program = require('commander')
const _ = require('lodash')
const utils = require('./utils')
const git = require('./git')
const shared = require('./shared')

program
  .option('-a --all', 'show all local branches')
  .option('-d --detailed', 'show detailed view')
  .action(utils.handle(async (options, cmd) => {
    const branches = cmd
      ? git.linesToBranches(cmd)
      : options.all
        ? (await git.getAllBranches())
        : (await git.getCurrentBranch())
    return shared.searchBranches(branches, options)
  }))
  .parse(process.argv)
