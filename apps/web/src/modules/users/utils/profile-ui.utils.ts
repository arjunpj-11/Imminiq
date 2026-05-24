export const cn = (
  ...classes: Array<string | false | null | undefined>
) => classes.filter(Boolean).join(' ')

export const themedScrollbar =
  '[scrollbar-width:thin] [scrollbar-color:rgba(184,76,43,0.28)_transparent] dark:[scrollbar-color:rgba(232,129,106,0.34)_transparent] [&::-webkit-scrollbar]:h-[6px] [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[rgba(184,76,43,0.28)] dark:[&::-webkit-scrollbar-thumb]:bg-[rgba(232,129,106,0.34)] [&::-webkit-scrollbar-thumb:hover]:bg-[rgba(184,76,43,0.44)] dark:[&::-webkit-scrollbar-thumb:hover]:bg-[rgba(232,129,106,0.52)]'
