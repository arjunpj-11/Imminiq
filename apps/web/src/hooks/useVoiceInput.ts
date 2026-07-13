import { useCallback, useEffect, useRef, useState } from 'react'

type SpeechRecognitionResultEvent = Event & {
  resultIndex: number
  results: {
    length: number
    [index: number]: {
      isFinal: boolean
      [index: number]: {
        transcript: string
      }
    }
  }
}

type BrowserSpeechRecognition = {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  onstart: (() => void) | null
  onend: (() => void) | null
  onerror: ((event: Event) => void) | null
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognition

type SpeechRecognitionWindow = Window &
  typeof globalThis & {
    SpeechRecognition?: BrowserSpeechRecognitionConstructor
    webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor
  }

const getSpeechRecognitionConstructor = () => {
  if (typeof window === 'undefined') return null

  const speechWindow = window as SpeechRecognitionWindow
  return (
    speechWindow.SpeechRecognition ??
    speechWindow.webkitSpeechRecognition ??
    null
  )
}

export const useVoiceInput = (onTranscript: (text: string) => void) => {
  const [isListening, setIsListening] = useState(false)
  const [isSupported] = useState(() =>
    Boolean(getSpeechRecognitionConstructor()),
  )

  const transcriptHandlerRef = useRef(onTranscript)
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null)
  const shouldListenRef = useRef(false)
  const restartTimeoutRef = useRef<number | null>(null)
  const startListeningRef = useRef<() => void>(() => undefined)

  useEffect(() => {
    transcriptHandlerRef.current = onTranscript
  }, [onTranscript])

  const clearRestartTimeout = useCallback(() => {
    if (restartTimeoutRef.current === null) return

    window.clearTimeout(restartTimeoutRef.current)
    restartTimeoutRef.current = null
  }, [])

  const scheduleRestart = useCallback(
    (delay: number) => {
      if (!shouldListenRef.current) return

      clearRestartTimeout()
      restartTimeoutRef.current = window.setTimeout(() => {
        if (shouldListenRef.current) {
          startListeningRef.current()
        }
      }, delay)
    },
    [clearRestartTimeout],
  )

  const startListening = useCallback(() => {
    const SpeechRecognitionConstructor = getSpeechRecognitionConstructor()
    if (!SpeechRecognitionConstructor || !isSupported) return

    shouldListenRef.current = true
    clearRestartTimeout()

    try {
      recognitionRef.current?.abort()
    } catch {
      recognitionRef.current = null
    }

    const recognition = new SpeechRecognitionConstructor()
    recognition.lang = 'en-US'
    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => {
      setIsListening(false)
      recognitionRef.current = null
      scheduleRestart(250)
    }
    recognition.onerror = () => {
      setIsListening(false)
      recognitionRef.current = null
      scheduleRestart(450)
    }
    recognition.onresult = (event) => {
      let finalTranscript = ''

      for (
        let index = event.resultIndex;
        index < event.results.length;
        index += 1
      ) {
        const result = event.results[index]
        const transcript = result?.[0]?.transcript?.trim()

        if (result?.isFinal && transcript) {
          finalTranscript += ` ${transcript}`
        }
      }

      const cleanedTranscript = finalTranscript.trim()
      if (cleanedTranscript) {
        transcriptHandlerRef.current(cleanedTranscript)
      }
    }

    recognitionRef.current = recognition

    try {
      recognition.start()
    } catch {
      setIsListening(false)
      recognitionRef.current = null
    }
  }, [clearRestartTimeout, isSupported, scheduleRestart])

  useEffect(() => {
    startListeningRef.current = startListening
  }, [startListening])

  const stopListening = useCallback(() => {
    shouldListenRef.current = false
    clearRestartTimeout()

    try {
      recognitionRef.current?.stop()
    } catch {
      recognitionRef.current = null
    }

    setIsListening(false)
  }, [clearRestartTimeout])

  const toggle = useCallback(() => {
    if (shouldListenRef.current || isListening) {
      stopListening()
      return
    }

    startListening()
  }, [isListening, startListening, stopListening])

  useEffect(() => {
    return () => {
      shouldListenRef.current = false
      clearRestartTimeout()

      try {
        recognitionRef.current?.abort()
      } catch {
        recognitionRef.current = null
      }
    }
  }, [clearRestartTimeout])

  return { isListening, isSupported, toggle }
}
