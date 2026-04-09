import * as core from '@actions/core'
import {Octokit} from '@octokit/rest'
import axios from 'axios'
import moment from 'moment-timezone'
import {createAdaptiveCard} from './message-card'

async function run(): Promise<void> {
  try {
    const githubToken = core.getInput('github-token', {required: true})
    const msTeamsWebhookUri: string = core.getInput('ms-teams-webhook-uri', {
      required: true
    })

    const stepOutcome = core.getInput('state')
    const timezone = core.getInput('timezone') || 'UTC'
    const verboseLogging = core.getInput('verbose-logging') == 'true'
    const timestamp = moment()
      .tz(timezone)
      .format('dddd, MMMM Do YYYY, h:mm:ss a z')

    const [owner, repo] = (process.env.GITHUB_REPOSITORY || '').split('/')
    const sha = process.env.GITHUB_SHA || ''
    const runId = process.env.GITHUB_RUN_ID || ''
    const runNum = process.env.GITHUB_RUN_NUMBER || ''
    const params = {owner, repo, ref: sha}
    const repoName = params.owner + '/' + params.repo
    const repoUrl = `https://github.com/${repoName}`

    const octokit = new Octokit({auth: `token ${githubToken}`})
    const commit = await octokit.repos.getCommit(params)
    const author = commit.data.author

    const messageCard = await createAdaptiveCard(
      commit,
      author,
      runNum,
      runId,
      repoName,
      sha,
      repoUrl,
      timestamp,
      stepOutcome
    )

    if (verboseLogging) {
      console.log(messageCard)
    }

    axios
      .post(msTeamsWebhookUri, messageCard)
      .then(function (response) {
        if (verboseLogging) {
          console.log(response)
        }
        core.debug(response.data)
      })
      .catch(function (error) {
        core.debug(error)
      })
  } catch (error: any) {
    console.log(error)
    core.setFailed(error.message)
  }
}

run()
