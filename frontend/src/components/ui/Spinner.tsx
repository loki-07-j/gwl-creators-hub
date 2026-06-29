export function Spinner({ size = 17, color = '#36b6c9', track = 'rgba(54,182,201,.25)' }: { size?: number; color?: string; track?: string }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        border: `2.5px solid ${track}`,
        borderTopColor: color,
        borderRadius: '50%',
        display: 'inline-block',
        animation: 'spin .8s linear infinite',
      }}
    />
  );
}
