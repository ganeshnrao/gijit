#!/usr/bin/env node

require("commander")
  .version(require("../package.json").version)
  .command("all", "Show information for all local branches")
  .command("search [query]", "Search for items")
  .command("detail [key]", "Show details for an item")
  .parse(process.argv);
