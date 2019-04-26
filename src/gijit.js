#!/usr/bin/env node

require("commander")
  .version(require("../package.json").version)
  .command("all", "Show information for all local branches")
  .command("search query", "Search for items")
  .command("detail [key]", "Show details for an item")
  .command("comment", "Add a new comment, or update existing comment")
  .command("projects", "Show all projects and boards")
  .command("user [name]", "Search users by name")
  .command("open [key", "Open issue in default browser")
  .parse(process.argv);
