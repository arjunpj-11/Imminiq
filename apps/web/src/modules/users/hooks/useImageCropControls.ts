import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type {
  CSSProperties,
  PointerEvent,
  WheelEvent,
} from 'react'

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

interface Size {
  width: number
  height: number
}

interface Offset {
  x: number
  y: number
}

interface DragStart {
  x: number
  y: number
  offsetX: number
  offsetY: number
}

const EMPTY_SIZE: Size = {
  width: 0,
  height: 0,
}

const EMPTY_OFFSET: Offset = {
  x: 0,
  y: 0,
}

function clamp(
  value: number,
  minimum: number,
  maximum: number,
): number {
  return Math.min(maximum, Math.max(minimum, value))
}

function getRenderedImageSize(
  imageSize: Size,
  previewSize: Size,
  scale: number,
): Size {
  if (
    imageSize.width <= 0 ||
    imageSize.height <= 0 ||
    previewSize.width <= 0 ||
    previewSize.height <= 0
  ) {
    return EMPTY_SIZE
  }

  const coverScale = Math.max(
    previewSize.width / imageSize.width,
    previewSize.height / imageSize.height,
  )

  return {
    width: imageSize.width * coverScale * scale,
    height: imageSize.height * coverScale * scale,
  }
}

function clampOffset(
  requestedOffset: Offset,
  imageSize: Size,
  previewSize: Size,
  scale: number,
): Offset {
  const renderedImageSize = getRenderedImageSize(
    imageSize,
    previewSize,
    scale,
  )

  if (
    renderedImageSize.width <= 0 ||
    renderedImageSize.height <= 0
  ) {
    return requestedOffset
  }

  const maximumX = Math.max(
    0,
    (renderedImageSize.width - previewSize.width) / 2,
  )

  const maximumY = Math.max(
    0,
    (renderedImageSize.height - previewSize.height) / 2,
  )

  return {
    x: clamp(requestedOffset.x, -maximumX, maximumX),
    y: clamp(requestedOffset.y, -maximumY, maximumY),
  }
}

export function useImageCropControls({
  initialScale,
  minScale,
  maxScale,
  wheelStep = 0.08,
}: UseImageCropControlsOptions) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [imageSize, setImageSize] = useState<Size>(EMPTY_SIZE)
  const [previewSize, setPreviewSize] =
    useState<Size>(EMPTY_SIZE)

  const [scaleState, setScaleState] = useState(() =>
    clamp(initialScale, minScale, maxScale),
  )

  const [rawOffset, setRawOffset] =
    useState<Offset>(EMPTY_OFFSET)

  const [dragging, setDragging] = useState(false)

  const previewRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)

  const dragStartRef = useRef<DragStart>({
    x: 0,
    y: 0,
    offsetX: 0,
    offsetY: 0,
  })

  const measurePreview = useCallback(() => {
    const preview = previewRef.current

    if (!preview) {
      return
    }

    const nextSize: Size = {
      width: preview.clientWidth,
      height: preview.clientHeight,
    }

    setPreviewSize((currentSize) => {
      if (
        currentSize.width === nextSize.width &&
        currentSize.height === nextSize.height
      ) {
        return currentSize
      }

      return nextSize
    })
  }, [])

  useEffect(() => {
    const preview = previewRef.current

    if (!imageSrc || !preview) {
      return undefined
    }

    const resizeObserver = new ResizeObserver(() => {
      measurePreview()
    })

    resizeObserver.observe(preview)

    return () => {
      resizeObserver.disconnect()
    }
  }, [imageSrc, measurePreview])

  /*
   * Clamp the stored position as derived data.
   * This replaces the old useEffect that synchronously called setOffset.
   */
  const offset = useMemo(
    () =>
      clampOffset(
        rawOffset,
        imageSize,
        previewSize,
        scaleState,
      ),
    [
      imageSize,
      previewSize,
      rawOffset,
      scaleState,
    ],
  )

  const setImageSource = useCallback(
    (source: string, nextScale = initialScale) => {
      const normalizedScale = clamp(
        nextScale,
        minScale,
        maxScale,
      )

      setImageSrc(source)
      setImageSize(EMPTY_SIZE)
      setScaleState(normalizedScale)
      setRawOffset(EMPTY_OFFSET)
      setDragging(false)

      imageRef.current = null

      const image = new Image()

      image.decoding = 'async'
      image.src = source

      image.onload = () => {
        if (image.src !== source) {
          return
        }

        imageRef.current = image

        setImageSize({
          width: image.naturalWidth,
          height: image.naturalHeight,
        })

        measurePreview()
      }

      image.onerror = () => {
        if (image.src !== source) {
          return
        }

        imageRef.current = null
        setImageSize(EMPTY_SIZE)
      }
    },
    [
      initialScale,
      maxScale,
      measurePreview,
      minScale,
    ],
  )

  const setScale = useCallback(
    (nextScale: number) => {
      const normalizedScale = clamp(
        nextScale,
        minScale,
        maxScale,
      )

      setScaleState(normalizedScale)

      setRawOffset((currentOffset) =>
        clampOffset(
          currentOffset,
          imageSize,
          previewSize,
          normalizedScale,
        ),
      )
    },
    [
      imageSize,
      maxScale,
      minScale,
      previewSize,
    ],
  )

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (!imageSrc) {
        return
      }

      dragStartRef.current = {
        x: event.clientX,
        y: event.clientY,
        offsetX: offset.x,
        offsetY: offset.y,
      }

      setDragging(true)

      event.currentTarget.setPointerCapture(event.pointerId)
    },
    [imageSrc, offset.x, offset.y],
  )

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (!dragging) {
        return
      }

      const dragStart = dragStartRef.current

      const requestedOffset: Offset = {
        x:
          dragStart.offsetX +
          (event.clientX - dragStart.x),
        y:
          dragStart.offsetY +
          (event.clientY - dragStart.y),
      }

      setRawOffset(
        clampOffset(
          requestedOffset,
          imageSize,
          previewSize,
          scaleState,
        ),
      )
    },
    [
      dragging,
      imageSize,
      previewSize,
      scaleState,
    ],
  )

  const handlePointerUp = useCallback(
    (event?: PointerEvent<HTMLDivElement>) => {
      setDragging(false)

      if (
        event &&
        event.currentTarget.hasPointerCapture(event.pointerId)
      ) {
        event.currentTarget.releasePointerCapture(
          event.pointerId,
        )
      }
    },
    [],
  )

  const handleWheel = useCallback(
    (event: WheelEvent<HTMLDivElement>) => {
      if (!imageSrc) {
        return
      }

      event.preventDefault()

      const direction =
        event.deltaY < 0 ? wheelStep : -wheelStep

      const nextScale = clamp(
        Number((scaleState + direction).toFixed(2)),
        minScale,
        maxScale,
      )

      setScaleState(nextScale)

      setRawOffset((currentOffset) =>
        clampOffset(
          currentOffset,
          imageSize,
          previewSize,
          nextScale,
        ),
      )
    },
    [
      imageSize,
      imageSrc,
      maxScale,
      minScale,
      previewSize,
      scaleState,
      wheelStep,
    ],
  )

  const renderedImageSize = useMemo(
    () =>
      getRenderedImageSize(
        imageSize,
        previewSize,
        scaleState,
      ),
    [imageSize, previewSize, scaleState],
  )

  const previewImageStyle =
    useMemo<CSSProperties | undefined>(() => {
      if (
        renderedImageSize.width <= 0 ||
        renderedImageSize.height <= 0
      ) {
        return undefined
      }

      return {
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: `${renderedImageSize.width}px`,
        height: `${renderedImageSize.height}px`,
        maxWidth: 'none',
        transform: [
          'translate(-50%, -50%)',
          `translate(${offset.x}px, ${offset.y}px)`,
        ].join(' '),
        transformOrigin: 'center center',
        userSelect: 'none',
        pointerEvents: 'none',
      }
    }, [
      offset.x,
      offset.y,
      renderedImageSize.height,
      renderedImageSize.width,
    ])

  const renderToDataUrl = useCallback(
    async ({
      width,
      height,
      mimeType = 'image/png',
      quality,
    }: RenderImageOptions): Promise<string | null> => {
      const preview = previewRef.current

      if (!imageSrc || !preview) {
        return null
      }

      const image =
        imageRef.current ?? (await loadImage(imageSrc))

      const measuredPreviewSize: Size = {
        width: preview.clientWidth,
        height: preview.clientHeight,
      }

      if (
        measuredPreviewSize.width <= 0 ||
        measuredPreviewSize.height <= 0 ||
        width <= 0 ||
        height <= 0
      ) {
        return null
      }

      const canvas = document.createElement('canvas')

      canvas.width = width
      canvas.height = height

      const context = canvas.getContext('2d')

      if (!context) {
        return null
      }

      const sourceSize: Size = {
        width: image.naturalWidth,
        height: image.naturalHeight,
      }

      const outputSize: Size = {
        width,
        height,
      }

      const outputRenderedSize = getRenderedImageSize(
        sourceSize,
        outputSize,
        scaleState,
      )

      const outputOffset: Offset = {
        x:
          offset.x *
          (width / measuredPreviewSize.width),
        y:
          offset.y *
          (height / measuredPreviewSize.height),
      }

      const drawX =
        (width - outputRenderedSize.width) / 2 +
        outputOffset.x

      const drawY =
        (height - outputRenderedSize.height) / 2 +
        outputOffset.y

      context.imageSmoothingEnabled = true
      context.imageSmoothingQuality = 'high'

      context.clearRect(0, 0, width, height)

      context.drawImage(
        image,
        drawX,
        drawY,
        outputRenderedSize.width,
        outputRenderedSize.height,
      )

      return canvas.toDataURL(mimeType, quality)
    },
    [
      imageSrc,
      offset.x,
      offset.y,
      scaleState,
    ],
  )

  return {
    imageSrc,
    scale: scaleState,
    setScale,
    offset,
    dragging,
    previewRef,
    previewImageStyle,
    setImageSource,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleWheel,
    renderToDataUrl,
  }
}