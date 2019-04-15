# Gijit

This tool loads JIRA information for your git branches, as long as your branches are named with the JIRA issue keys.

## Installation

Install Gijit globally with the following.

```
$ npm install -g gijit
```

The very first time you invoke `gijit` it will ask for your atlassian host, username and password. This information will be stored in your home folder as a file `gijit.config.js`.

```
$ gijit
```

## Commands

### `gijit all`

Show information for all local branches. The response will look like the following.

```
┌────────────┬─────────────────────────┬──────┬──────────┬─────────┬──────────┬─────────┬────────┐
│ Key        │ Summary                 │ Type │ Priority │ Status  │ Assignee │ Creator │ Labels │
├────────────┼─────────────────────────┼──────┼──────────┼─────────┼──────────┼─────────┼────────┤
│ DEV-5814   │ Create a get all page   │ Task │ Major    │ Open    │ foo.bar  │ baz.tar │ page   │
├────────────┼─────────────────────────┼──────┼──────────┼─────────┼──────────┼─────────┼────────┤
│ DEV-5975   │ Create a search feature │ Task │ Major    │ Open    │ foo.bar  │ baz.tar │ search │
├────────────┼─────────────────────────┼──────┼──────────┼─────────┼──────────┼─────────┼────────┤
│ DEV-6745 * │ Fix bug in show details │ Bug  │ Minor    │ Testing │ foo.bar  │ baz.tar │ detail │
└────────────┴─────────────────────────┴──────┴──────────┴─────────┴──────────┴─────────┴────────┘
```

### `gijit detail`

This shows the detailed view for the JIRA item associated with the current branch.

### `gijit detail <issueKey>`

Optionally you can pass a JIRA issue key, e.g. `gijit detail DEV-1234`, and it will show information for issue with key `DEV-1234`.

### `gijit search <jiraQuery>`

This will return the search results for any JIRA query, for example `gijit search 'assignee=foo.bar and status=open'`

## Customization

You can customize how the items are rendered by editing the `gijit.config.js` file, and add a property called `config`. The following properties are allowed (and are the defaults).

```js
// contents of gijit.config.js
module.exports = {
  host: /* host */,
  username: /* your username */,
  password: /* your password */,
  config: {
    colors: true, // enable/disable colors
    fields: {
      key: { color: "bold" }, // any of the chalk colors are allowed
      summary: { width: 80 },
      issuetype: { color: "cyan" },
      priority: { color: "magenta" },
      status: { color: "gray" },
      project: {},
      assignee: { color: "blue" },
      reporter: { color: "green" },
      creator: { color: "green" },
      created: { color: "dim" },
      updated: { color: "dim" },
      environment: { color: "dim" },
      labels: { color: "yellow", width: 30 },
      description: { width: 80 }
    },
    lineFields: [
      // fields to be displayed in the table for
      // `gijit all` and `gijit search` commands
      "key",
      "summary",
      "issuetype",
      "priority",
      "status",
      "assignee",
      "creator",
      "labels"
    ]
  }
}
```