// Visibly provisional content. Never styled like real copy.
export default function Placeholder({ children, block = false }) {
  const Tag = block ? 'div' : 'span';
  return (
    <Tag className={'ph' + (block ? ' ph--block' : '')} data-placeholder>
      <span className="sr-only">Placeholder: </span>[{children}]
    </Tag>
  );
}
