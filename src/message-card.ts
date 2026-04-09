type StepOutcome = 'success' | 'failure' | 'cancelled' | 'skipped'

function getOutcomeColor(outcome: StepOutcome): string {
  switch (outcome) {
    case 'success':   return 'good'
    case 'failure':   return 'attention'
    case 'cancelled': return 'warning'
    case 'skipped':   return 'accent'
  }
}

function getOutcomeLabel(outcome: StepOutcome): string {
  switch (outcome) {
    case 'success':   return '✔ Tests passed'
    case 'failure':   return '✘ Tests failed'
    case 'cancelled': return '⊘ Tests cancelled'
    case 'skipped':   return '⊖ Tests skipped'
  }
}

export function createAdaptiveCard(
  commit: any,
  author: any,
  runNum: string,
  runId: string,
  repoName: string,
  sha: string,
  repoUrl: string,
  timestamp: string,
  testOutcome: StepOutcome
): any {
  let avatar_url =
    'https://www.gravatar.com/avatar/05b6d8cc7c662bf81e01b39254f88a48?d=identicon'
  if (author?.avatar_url) {
    avatar_url = author.avatar_url
  }

  let author_url = ''
  if (author?.login && author?.html_url) {
    author_url = `[(@${author.login})](${author.html_url})`
  }

  return {
    type: 'AdaptiveCard',
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    version: '1.4',
    body: [
      {
        type: 'ColumnSet',
        columns: [
          {
            type: 'Column',
            width: 'auto',
            items: [
              {
                type: 'Image',
                url: avatar_url,
                size: 'Small',
                style: 'Person'
              }
            ]
          },
          {
            type: 'Column',
            width: 'stretch',
            items: [
              {
                type: 'TextBlock',
                text: `**CI #${runNum} (commit ${sha.substr(0, 7)})** on [${repoName}](${repoUrl})`,
                wrap: true,
                weight: 'Bolder'
              },
              {
                type: 'TextBlock',
                text: getOutcomeLabel(testOutcome),
                wrap: false,
                weight: 'Bolder',
                color: getOutcomeColor(testOutcome),
                spacing: 'Small'
              },
              {
                type: 'TextBlock',
                text: `by ${commit.data.commit.author.name} ${author_url} on ${timestamp}`,
                wrap: true,
                isSubtle: true,
                spacing: 'None'
              }
            ]
          }
        ]
      }
    ],
    actions: [
      {
        type: 'Action.OpenUrl',
        title: 'View Workflow Run',
        url: `${repoUrl}/actions/runs/${runId}`
      },
      {
        type: 'Action.OpenUrl',
        title: 'View Commit Changes',
        url: commit.data.html_url
      }
    ]
  }
}
