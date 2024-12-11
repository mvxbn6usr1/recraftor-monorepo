interface ImageBadgeProps {
  type: 'variant' | 'processing';
}

export function ImageBadge({ type }: ImageBadgeProps) {
  return (
    <div className="absolute top-2 left-2 px-2 py-1 bg-white/10 rounded text-xs text-white">
      {type === 'variant' ? 'Variant' : 'Processing'}
    </div>
  );
}