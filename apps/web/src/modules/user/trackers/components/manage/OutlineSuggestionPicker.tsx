import type { TrackerOutlineNode } from '../../utils/tracker-outline';

type Props = {
  nodes: TrackerOutlineNode[];
  selectedPaths: Set<string>;
  onChange: (paths: Set<string>) => void;
  parentPath?: string;
  depth?: number;
};

export default function OutlineSuggestionPicker({
  nodes,
  selectedPaths,
  onChange,
  parentPath = '',
  depth = 0,
}: Props) {
  if (!nodes.length) return null;

  return (
    <div className={depth ? 'mt-2 space-y-2 border-l border-(--border-subtle) pl-3' : 'space-y-2'}>
      {nodes.map((node, index) => {
        const path = parentPath ? `${parentPath}.${index}` : String(index);
        const checked = selectedPaths.has(path);
        return (
          <div
            key={`${path}-${node.title}`}
            className="rounded-lg border border-(--border-subtle) bg-(--surface-canvas) p-3"
          >
            <label className="flex cursor-pointer items-start gap-2.5">
              <input
                type="checkbox"
                checked={checked}
                onChange={(event) => {
                  const next = new Set(selectedPaths);
                  const prefix = `${path}.`;
                  if (event.target.checked) next.add(path);
                  else
                    [...next].forEach(
                      (item) => (item === path || item.startsWith(prefix)) && next.delete(item)
                    );
                  onChange(next);
                }}
                className="mt-0.5 h-4 w-4 accent-(--brand-500)"
              />
              <span className="min-w-0">
                <span className="block text-[12px] font-bold text-(--text-primary)">
                  {node.title}
                </span>
                {node.description && (
                  <span className="mt-0.5 block text-[11px] leading-relaxed text-(--text-secondary)">
                    {node.description}
                  </span>
                )}
              </span>
            </label>
            {checked && (
              <OutlineSuggestionPicker
                nodes={node.subtopics}
                selectedPaths={selectedPaths}
                onChange={onChange}
                parentPath={path}
                depth={depth + 1}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
