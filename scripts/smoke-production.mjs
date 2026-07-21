const webUrl = process.env.WEB_URL?.replace(/\/$/, '')
const apiUrl = process.env.API_URL?.replace(/\/$/, '')

if (!webUrl || !apiUrl) {
  console.error('WEB_URL and API_URL are required')
  process.exit(2)
}

const checks = [
  { name: 'frontend', url: webUrl, contentType: 'text/html' },
  {
    name: 'frontend API proxy',
    url: `${webUrl}/api/health/live`,
    contentType: 'application/json',
  },
  { name: 'API liveness', url: `${apiUrl}/api/health/live`, contentType: 'application/json' },
  { name: 'API readiness', url: `${apiUrl}/api/health/ready`, contentType: 'application/json' },
]

for (const check of checks) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)

  try {
    const response = await fetch(check.url, { signal: controller.signal })
    const actualContentType = response.headers.get('content-type') ?? ''

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    if (!actualContentType.includes(check.contentType)) {
      throw new Error(`expected ${check.contentType}, received ${actualContentType || 'no content type'}`)
    }

    console.log(`PASS ${check.name}: ${check.url}`)
  } finally {
    clearTimeout(timeout)
  }
}
