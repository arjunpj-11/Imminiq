import { env } from '../../../config/env'

interface CloudflareImageResponse {
  success: boolean
  result?: {
    image?: string
  }
  errors?: Array<{
    code?: number
    message?: string
  }>
  messages?: string[]
}

interface GenerateCloudflareImageParams {
  prompt: string
  steps?: number
  seed?: number
}

export const generateImageWithCloudflare = async ({
  prompt,
  steps = 4,
  seed,
}: GenerateCloudflareImageParams) => {
  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/ai/run/${env.CLOUDFLARE_IMAGE_MODEL}`

  const payload: Record<string, string | number> = {
    prompt,
    steps,
  }

  if (typeof seed === 'number') {
    payload.seed = seed
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.CLOUDFLARE_AI_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = (await response.json()) as CloudflareImageResponse

  if (!response.ok || !data.success) {
    const cloudflareMessage =
      data.errors?.[0]?.message ||
      'Cloudflare image generation failed'

    throw new Error(cloudflareMessage)
  }

  const base64Image = data.result?.image

  if (!base64Image) {
    throw new Error(
      'Cloudflare returned no generated image'
    )
  }

  return {
    base64Image,
    dataUrl: `data:image/jpeg;base64,${base64Image}`,
  }
}