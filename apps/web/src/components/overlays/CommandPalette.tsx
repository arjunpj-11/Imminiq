import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type RefObject,
} from 'react'
import { useNavigate } from 'react-router-dom'

import { cn } from '../../lib/cn'
import {
  formatNavigationShortcut,
  NAVIGATION_COMMANDS,
  scoreCommandSearch,
  type NavigationShortcut,
} from '../../lib/navigation-commands'
import { useThemeStore } from '../../store/useThemeStore'
import Modal from './Modal'

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

interface CommandPaletteContentProps {
  inputRef: RefObject<HTMLInputElement | null>
  onClose: () => void
}

interface Command {
  id: string
  label: string
  description: string
  group: 'Navigate' | 'Actions'
  keywords: readonly string[]
  path?: string
  shortcut?: NavigationShortcut
  run: () => void
}

const GROUP_ORDER: Record<Command['group'], number> = {
  Navigate: 0,
  Actions: 1,
}

const SearchIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
)

export default function CommandPalette({
  open,
  onClose,
}: CommandPaletteProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <Modal
      open={open}
      onClose={onClose}
      ariaLabel="Imminiq command palette"
      initialFocusRef={inputRef}
      contentClassName="max-w-2xl p-0"
      overlayClassName="items-start pt-[min(14vh,120px)]"
    >
      {open ? (
        <CommandPaletteContent
          inputRef={inputRef}
          onClose={onClose}
        />
      ) : null}
    </Modal>
  )
}

function CommandPaletteContent({
  inputRef,
  onClose,
}: CommandPaletteContentProps) {
  const navigate = useNavigate()
  const toggleTheme = useThemeStore((state) => state.toggleTheme)

  const optionRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)

  const go = useCallback(
    (path: string) => {
      onClose()
      navigate(path)
    },
    [navigate, onClose],
  )

  const commands = useMemo<Command[]>(
    () => [
      ...NAVIGATION_COMMANDS.map((command) => ({
        ...command,
        group: 'Navigate' as const,
        run: () => go(command.path),
      })),
      {
        id: 'theme',
        label: 'Toggle theme',
        description: 'Switch between light and dark appearance',
        group: 'Actions' as const,
        keywords: [
          'dark',
          'light',
          'mode',
          'appearance',
          'theme',
          'colour scheme',
        ],
        run: () => {
          toggleTheme()
          onClose()
        },
      },
    ],
    [go, onClose, toggleTheme],
  )

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim()

    if (!normalizedQuery) {
      return commands
    }

    return commands
      .map((command, originalIndex) => ({
        command,
        originalIndex,
        score: scoreCommandSearch(command, normalizedQuery),
      }))
      .filter((result) => result.score >= 0)
      .sort(
        (left, right) =>
          GROUP_ORDER[left.command.group] -
            GROUP_ORDER[right.command.group] ||
          right.score - left.score ||
          left.originalIndex - right.originalIndex,
      )
      .map((result) => result.command)
  }, [commands, query])

  /*
   * Do not synchronously correct activeIndex inside an effect.
   * Derive a valid index from the current result count instead.
   */
  const safeActiveIndex =
    filtered.length === 0
      ? 0
      : Math.min(activeIndex, filtered.length - 1)

  const activeCommand = filtered[safeActiveIndex]

  useEffect(() => {
    if (!activeCommand) {
      return
    }

    const frameId = window.requestAnimationFrame(() => {
      optionRefs.current[activeCommand.id]?.scrollIntoView({
        block: 'nearest',
        behavior: 'auto',
      })
    })

    return () => {
      window.cancelAnimationFrame(frameId)
    }
  }, [activeCommand])

  const moveActive = (nextIndex: number) => {
    if (filtered.length === 0) {
      return
    }

    const wrappedIndex =
      (nextIndex + filtered.length) % filtered.length

    setActiveIndex(wrappedIndex)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      moveActive(safeActiveIndex + 1)
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      moveActive(safeActiveIndex - 1)
      return
    }

    if (event.key === 'Home') {
      event.preventDefault()
      setActiveIndex(0)
      return
    }

    if (event.key === 'End') {
      event.preventDefault()
      setActiveIndex(Math.max(0, filtered.length - 1))
      return
    }

    if (event.key === 'PageDown') {
      event.preventDefault()
      moveActive(safeActiveIndex + 5)
      return
    }

    if (event.key === 'PageUp') {
      event.preventDefault()
      moveActive(safeActiveIndex - 5)
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      activeCommand?.run()
    }
  }

  let renderedGroup: Command['group'] | null = null

  return (
    <div onKeyDown={handleKeyDown}>
      <div className="flex items-center gap-3 border-b border-(--border-subtle) px-4">
        <span className="text-(--text-muted)">
          <SearchIcon />
        </span>

        <input
          ref={inputRef}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setActiveIndex(0)
          }}
          placeholder="Search every page and action…"
          aria-label="Search pages and actions"
          aria-controls="imminiq-command-list"
          aria-activedescendant={
            activeCommand
              ? `imminiq-command-${activeCommand.id}`
              : undefined
          }
          aria-autocomplete="list"
          autoComplete="off"
          spellCheck={false}
          className="h-14 min-w-0 flex-1 bg-transparent text-[14px] font-medium text-(--text-primary) outline-none placeholder:text-(--text-muted)"
        />

        <kbd className="rounded-sm border border-(--border-subtle) bg-(--surface-muted) px-2 py-1 font-mono text-[9px] text-(--text-muted)">
          ESC
        </kbd>
      </div>

      <div
        id="imminiq-command-list"
        className="max-h-[min(56vh,430px)] overflow-y-auto overscroll-contain p-2"
        role="listbox"
        aria-label="Pages and actions"
      >
        {filtered.length > 0 ? (
          filtered.map((command, index) => {
            const showGroup = command.group !== renderedGroup
            renderedGroup = command.group

            return (
              <div key={command.id}>
                {showGroup && (
                  <div className="type-label-sm px-2.5 pb-1.5 pt-3 text-(--text-muted) first:pt-1.5">
                    {command.group}
                  </div>
                )}

                <button
                  id={`imminiq-command-${command.id}`}
                  ref={(element) => {
                    optionRefs.current[command.id] = element
                  }}
                  type="button"
                  role="option"
                  aria-selected={index === safeActiveIndex}
                  onFocus={() => setActiveIndex(index)}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={command.run}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition',
                    index === safeActiveIndex
                      ? 'bg-[color-mix(in_srgb,var(--brand-500)_10%,transparent)] text-(--brand-500)'
                      : 'text-(--text-primary) hover:bg-(--surface-muted)',
                  )}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-(--border-subtle) bg-(--surface-card) font-mono text-[11px] font-bold">
                    {command.label.charAt(0)}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-[670]">
                      {command.label}
                    </span>

                    <span className="mt-0.5 block truncate text-[11px] text-(--text-secondary)">
                      {command.description}
                    </span>
                  </span>

                  {command.shortcut && (
                    <kbd
                      className="shrink-0 rounded-sm bg-(--surface-muted) px-2 py-1 font-mono text-[9px] text-(--text-muted)"
                      title={`Global shortcut: press ${formatNavigationShortcut(
                        command.shortcut,
                      ).replace(' ', ' then ')}`}
                      aria-label={`Global shortcut: ${formatNavigationShortcut(
                        command.shortcut,
                      ).replace(' ', ' then ')}`}
                    >
                      {formatNavigationShortcut(command.shortcut)}
                    </kbd>
                  )}
                </button>
              </div>
            )
          })
        ) : (
          <div
            className="px-5 py-12 text-center"
            role="status"
          >
            <div className="type-heading-md text-(--text-primary)">
              No matching page or action
            </div>

            <p className="type-body-sm mt-1 text-(--text-secondary)">
              Try a page name, related word, or shortcut such as GD.
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-(--border-subtle) px-4 py-2.5 font-mono text-[9px] text-(--text-muted)">
        <span>↑↓ Navigate</span>
        <span>↵ Open</span>
        <span>Esc Close</span>
        <span>G then key · Quick go outside search</span>

        <span
          className="ml-auto"
          aria-live="polite"
        >
          {filtered.length}{' '}
          {filtered.length === 1 ? 'result' : 'results'}
        </span>
      </div>
    </div>
  )
}