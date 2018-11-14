# Gijit
This tool loads JIRA information for your git branches, as long as your branches are named with the JIRA issue keys.

## Commands
Install Gijit globally with the following.
```
$ npm install -g gijit
```

The very first time you invoke `gijit` it will ask for your atlassian host, username and password. This information will be stored in your home folder as a file `gijit.config.js`.
```
$ gijit
```

Once initialized, when you invoke `gijit` it will pull the JIRA information for the current branch that you're on.

To show JIRA info for all branches use `gijit -a`, the responseoutput will look like the following.
```
* DEV-1234  Create application          Code Review   Ganesh Rao    Major
DEV-1235    Write unit tests            In Progress   Ganesh Rao    Major
DEV-1236    Setup database              Closed        Ganesh Rao    Major
```