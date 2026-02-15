import axios from 'axios'
import { subDays } from 'date-fns'

const GITHUB_API = 'https://api.github.com'

export interface Repository {
  id: number
  name: string
  full_name: string
  private: boolean
  html_url: string
  description: string | null
  updated_at: string
}

export async function fetchUserRepositories(token: string): Promise<Repository[]> {
  const response = await axios.get(`${GITHUB_API}/user/repos`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
    params: {
      sort: 'updated',
      per_page: 100,
      affiliation: 'owner',
    },
  })
  return response.data
}

export async function fetchContributions(token: string): Promise<Record<string, number>> {
  const username = await getCurrentUser(token)

  // Get contributions for the past year
  const endDate = new Date()
  const startDate = subDays(endDate, 365)

  const contributions: Record<string, number> = {}

  // Use GraphQL to get contribution calendar
  const query = `
    query($username: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $username) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `

  const response = await axios.post(
    `${GITHUB_API}/graphql`,
    {
      query,
      variables: {
        username,
        from: startDate.toISOString(),
        to: endDate.toISOString(),
      },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  )

  const weeks = response.data.data.user.contributionsCollection.contributionCalendar.weeks

  for (const week of weeks) {
    for (const day of week.contributionDays) {
      contributions[day.date] = day.contributionCount
    }
  }

  return contributions
}

export async function getCurrentUser(token: string): Promise<string> {
  const response = await axios.get(`${GITHUB_API}/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data.login
}

export async function createCommit(
  token: string,
  owner: string,
  repo: string,
  message: string,
  date: string,
  branch: string = 'main'
): Promise<void> {
  // Get the default branch reference
  const refResponse = await axios.get(`${GITHUB_API}/repos/${owner}/${repo}/git/ref/heads/${branch}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const sha = refResponse.data.object.sha

  // Create a blob for an empty file (or minimal content)
  const blobResponse = await axios.post(
    `${GITHUB_API}/repos/${owner}/${repo}/git/blobs`,
    {
      content: Buffer.from(`# Contribution: ${date}\n`).toString('base64'),
      encoding: 'base64',
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  )

  const blobSha = blobResponse.data.sha

  // Create tree
  const treeResponse = await axios.post(
    `${GITHUB_API}/repos/${owner}/${repo}/git/trees`,
    {
      base_tree: sha,
      tree: [
        {
          path: `contributions/${date}.md`,
          mode: '100644',
          type: 'blob',
          sha: blobSha,
        },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  )

  const treeSha = treeResponse.data.sha

  // Create commit with author date
  const commitResponse = await axios.post(
    `${GITHUB_API}/repos/${owner}/${repo}/git/commits`,
    {
      message,
      tree: treeSha,
      parents: [sha],
      author: {
        name: 'GitHub Contribution Generator',
        email: 'noreply@github.com',
        date: `${date}T12:00:00Z`,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  )

  // Update reference
  await axios.patch(
    `${GITHUB_API}/repos/${owner}/${repo}/git/refs/heads/${branch}`,
    {
      sha: commitResponse.data.sha,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  )
}
