// apps/web/src/modules/legal/utils/legal-ui.ts

export const cn = (...classes: Array<string | false | null | undefined>) => {
  return classes.filter(Boolean).join(' ')
}

export const scrollbarClass =
  '[scrollbar-width:thin] [scrollbar-color:#b84c2b_transparent] dark:[scrollbar-color:#e8816a_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[rgba(184,76,43,0.35)] dark:[&::-webkit-scrollbar-thumb]:bg-[rgba(232,129,106,0.45)] [&::-webkit-scrollbar-thumb:hover]:bg-[#b84c2b] dark:[&::-webkit-scrollbar-thumb:hover]:bg-[#e8816a]'