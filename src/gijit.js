#!/usr/bin/env node

require("commander")
  .version("0.0.1")
  .command("all", "Show information for all local branches")
  .command("search [query]", "Search for items")
  .command("detail [key]", "Show details for an item")
  .parse(process.argv);
