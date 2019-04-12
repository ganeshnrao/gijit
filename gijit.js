#!/usr/bin/env node

'use strict'

require('commander')
  .version('0.0.1')
  .command('search', 'search for JIRA items')
  .command('show', 'show details for a JIRA item')
  .command('detailed', 'show details for a JIRA item')
  .parse(process.argv)

