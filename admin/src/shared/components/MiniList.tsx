type MiniListProps = {
  emptyLabel: string;
  items: string[];
};

export function MiniList({ items, emptyLabel }: MiniListProps) {
  if (items.length === 0) {
    return <p className="mini-empty">{emptyLabel}</p>;
  }

  return <ul className="mini-list">{items.map((item) => <li key={item}>{item}</li>)}</ul>;
}
