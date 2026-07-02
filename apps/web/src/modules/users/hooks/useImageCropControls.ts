import { useCallback, useRef, useState } from 'react'
import type { PointerEvent, WheelEvent } from 'react'

import { loadImage } from '../utils/profile-image.utils'

interface UseImageCropControlsOptions {
  initialScale: number
  minScale: number
  maxScale: number
  wheelStep?: number
}

interface RenderImageOptions {
  width: number
  height: number
  mimeType?: string
  quality?: number
}

export function useImageCropControls({
  initialScale,
  minScale,
  maxScale,
  wheelStep = 0.08,
}: UseImageCropControlsOptions) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [scale, setScale] = useState(initialScale)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState({
    x: 0,
    y: 0,
    ox: 0,
    oy: 0,
  })

  const previewRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)

  const setImageSource = useCallback(
    (source: string, nextScale = initialScale) => {
      setImageSrc(source)
      setScale(nextScale)
      setOffset({ x: 0, y: 0 })
      setDragging(false)
      imageRef.current = null

      const image = new Image()
      image.src = source
      image.onload = () => {
        imageRef.current = image
      }
    },
    [initialScale],
  )

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (!imageSrc) return

      setDragging(true)
      setDragStart({
        x: event.clientX,
        y: event.clientY,
        ox: offset.x,
        oy: offset.y,
      })
      event.currentTarget.setPointerCapture(event.pointerId)
    },
    [imageSrc, offset.x, offset.y],
  )

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (!dragging) return

      setOffset({
        x: dragStart.ox + (event.clientX - dragStart.x),
        y: dragStart.oy + (event.clientY - dragStart.y),
      })
    },
    [dragStart, dragging],
  )

  const handlePointerUp = useCallback(() => setDragging(false), [])

  const handleWheel = useCallback(
    (event: WheelEvent<HTMLDivElement>) => {
      if (!imageSrc) return

      event.preventDefault()
      setScale((current) =>
        Math.min(
          maxScale,
          Math.max(
            minScale,
            Number(
              (current + (event.deltaY < 0 ? wheelStep : -wheelStep)).toFixed(
                2,
              ),
            ),
          ),
        ),
      )
    },
    [imageSrc, maxScale, minScale, wheelStep],
  )

  const renderToDataUrl = useCallback(
    async ({
      width,
      height,
      mimeType = 'image/png',
      quality,
    }: RenderImageOptions) => {
      if (!imageSrc || !previewRef.current) return null

      const image = imageRef.current ?? (await loadImage(imageSrc))
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const context = canvas.getContext('2d')
      if (!context) return null

      const preview = previewRef.current.getBoundingClientRect()
      const fitScale = Math.max(
        width / image.naturalWidth,
        height / image.naturalHeight,
      )
      const renderScale = fitScale * scale
      const drawWidth = image.naturalWidth * renderScale
      const drawHeight = image.naturalHeight * renderScale
      const ratioX = width / Math.max(preview.width, 1)
      const ratioY = height / Math.max(preview.height, 1)
      const drawX = (width - drawWidth) / 2 + offset.x * ratioX
      const drawY = (height - drawHeight) / 2 + offset.y * ratioY

      context.drawImage(image, drawX, drawY, drawWidth, drawHeight)
      return canvas.toDataURL(mimeType, quality)
    },
    [imageSrc, offset.x, offset.y, scale],
  )

  return {
    imageSrc,
    scale,
    setScale,
    offset,
    dragging,
    previewRef,
    setImageSource,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleWheel,
    renderToDataUrl,
  }
}
