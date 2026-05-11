import { useThemeStore } from '../../store/useThemeStore'

export default function ThemeToggle() {
  const theme = useThemeStore((state) => state.theme)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="rounded-full border border-[#e0d0c5] bg-white px-3 py-2 text-xs font-medium text-[#1a1714] transition hover:border-[#b84c2b] dark:border-white/15 dark:bg-[#252320] dark:text-[#f2f0eb] dark:hover:border-[#e8816a]"
    >
      {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
    </button>
  )
}