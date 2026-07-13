export default function ProfileDocumentStyles() {
  return (
    <style>{`
      html,
      body {
        background: #f5ede4;
        overflow-x: hidden;
        scrollbar-width: thin;
        scrollbar-color: rgba(184, 76, 43, 0.42) transparent;
      }

      html.dark,
      html.dark body {
        background: #141412;
        scrollbar-color: rgba(232, 129, 106, 0.48) transparent;
      }

      html::-webkit-scrollbar,
      body::-webkit-scrollbar {
        width: 8px;
        height: 8px;
        background: transparent;
      }

      html::-webkit-scrollbar-track,
      body::-webkit-scrollbar-track,
      html::-webkit-scrollbar-track-piece,
      body::-webkit-scrollbar-track-piece,
      html::-webkit-scrollbar-corner,
      body::-webkit-scrollbar-corner {
        background: transparent;
      }

      html::-webkit-scrollbar-thumb,
      body::-webkit-scrollbar-thumb {
        border-radius: 999px;
        border: 2px solid transparent;
        background-clip: padding-box;
        background-color: rgba(184, 76, 43, 0.42);
      }

      html::-webkit-scrollbar-thumb:hover,
      body::-webkit-scrollbar-thumb:hover {
        background-color: rgba(184, 76, 43, 0.62);
      }

      html.dark::-webkit-scrollbar-thumb,
      html.dark body::-webkit-scrollbar-thumb {
        background-color: rgba(232, 129, 106, 0.48);
      }

      html.dark::-webkit-scrollbar-thumb:hover,
      html.dark body::-webkit-scrollbar-thumb:hover {
        background-color: rgba(232, 129, 106, 0.70);
      }
    `}</style>
  )
}
