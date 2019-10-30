#!/usr/bin/env node
const util = require('util')
const fs = require("fs");
const graphql = require("@octokit/graphql").graphql.defaults({
  headers: {
    authorization: `token ${process.env.GITHUB_TOKEN}`
  }
});

const doIt = async function() {
  const fileContents = fs.readFileSync(process.env.GITHUB_EVENT_PATH, "utf8");
  const context = JSON.parse(fileContents);
  const user = context.sender.login
  const organization = context.repository.owner.login
  const team = process.argv[2]

  const teamQuery = `
  query teamMember($organization: String!, $user: String!, $team: String!)  {
    organization(login: $organization) {
      teams(first: 100, userLogins: [$user], query: $team) {
        nodes {
          name
        }
      }
    }
  }
  `

  const result = await graphql(teamQuery, { organization, user, team })
  console.log(result)
  const teamNames = result.organization.teams.nodes.map(team => team.name)

  if (teamNames.includes(team)) {
    return Promise.resolve(0)
  } else {
    return Promise.reject(1)
  }
}

doIt()
  .then((exitCode) => process.exit(exitCode))
  .catch((error) => { throw error })
