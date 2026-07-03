const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

export const formatMathTextToHtml = (value: string) => {
  let html = escapeHtml(value)

  html = html.replace(
    /\$\$([\s\S]*?)\$\$/g,
    (_match, equation: string) =>
      `<div class="my-4 overflow-x-auto rounded-xl border border-(--border-subtle) bg-[#fffaf6] px-4 py-3 text-center font-mono text-[15px] text-(--text-primary) dark:border-(--border-subtle) dark:bg-(--surface-canvas) dark:text-(--text-primary)">${equation.trim()}</div>`
  )
  html = html.replace(
    /\\\[([\s\S]*?)\\\]/g,
    (_match, equation: string) =>
      `<div class="my-4 overflow-x-auto rounded-xl border border-(--border-subtle) bg-[#fffaf6] px-4 py-3 text-center font-mono text-[15px] text-(--text-primary) dark:border-(--border-subtle) dark:bg-(--surface-canvas) dark:text-(--text-primary)">${equation.trim()}</div>`
  )
  html = html.replace(
    /\\\((.*?)\\\)/g,
    (_match, equation: string) =>
      `<span class="mx-1 rounded-md bg-[rgba(184,76,43,0.08)] px-1.5 py-0.5 font-mono text-[0.95em] text-[#8a3d24] dark:bg-[rgba(232,129,106,0.10)] dark:text-[#f5a090]">${equation.trim()}</span>`
  )
  html = html.replace(
    /\\frac\{([^{}]+)\}\{([^{}]+)\}/g,
    (_match, numerator: string, denominator: string) =>
      `<span class="inline-flex translate-y-[0.25em] flex-col items-center justify-center px-1 font-mono leading-none"><span class="border-b border-current px-1 pb-0.5 text-[0.82em]">${numerator}</span><span class="px-1 pt-0.5 text-[0.82em]">${denominator}</span></span>`
  )
  html = html.replace(/\^\{([^{}]+)\}/g, (_match, power: string) => `<sup>${power}</sup>`)
  html = html.replace(/_\{([^{}]+)\}/g, (_match, sub: string) => `<sub>${sub}</sub>`)
  html = html.replace(/\^([a-zA-Z0-9+\-=]+)/g, (_match, power: string) => `<sup>${power}</sup>`)
  html = html.replace(/_([a-zA-Z0-9+\-=]+)/g, (_match, sub: string) => `<sub>${sub}</sub>`)
  html = html.replace(/\\times/g, '×')
  html = html.replace(/\\div/g, '÷')
  html = html.replace(/\\pm/g, '±')
  html = html.replace(/\\sqrt\{([^{}]+)\}/g, '√($1)')
  html = html.replace(/\\leq/g, '≤')
  html = html.replace(/\\geq/g, '≥')
  html = html.replace(/\\neq/g, '≠')
  html = html.replace(/\\alpha/g, 'α')
  html = html.replace(/\\beta/g, 'β')
  html = html.replace(/\\theta/g, 'θ')
  html = html.replace(/\\pi/g, 'π')
  html = html.replace(/\n/g, '<br />')

  return html
}
