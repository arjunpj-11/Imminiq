export function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Could not load image'))
    image.src = src
  })
}

export async function bannerDataUrlToPng(dataUrl: string) {
  const image = await loadImage(dataUrl)
  const width = 1600
  const height = 400

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Could not prepare banner canvas')
  }

  ctx.drawImage(image, 0, 0, width, height)

  return canvas.toDataURL('image/png')
}

export function svgBannerDataUrl(start: string, mid: string, end: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1600" height="400" viewBox="0 0 1600 400">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${start}"/>
          <stop offset="55%" stop-color="${mid}"/>
          <stop offset="100%" stop-color="${end}"/>
        </linearGradient>
        <radialGradient id="r" cx="50%" cy="45%" r="65%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.32)"/>
          <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
        </radialGradient>
        <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
          <path d="M48 0H0V48" fill="none" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="1600" height="400" fill="url(#g)"/>
      <rect width="1600" height="400" fill="url(#grid)" opacity="0.6"/>
      <circle cx="800" cy="170" r="270" fill="url(#r)"/>
    </svg>
  `

  const encodedBytes = new TextEncoder().encode(svg)
  let binary = ''

  encodedBytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })

  return `data:image/svg+xml;base64,${btoa(binary)}`
}
