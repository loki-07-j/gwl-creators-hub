import React from 'react';

/** A single shimmer block. */
export function Skel({ w = '100%', h = 14, r = 8, style }: { w?: number | string; h?: number | string; r?: number; style?: React.CSSProperties }) {
  return <div className="skel" style={{ width: w, height: h, borderRadius: r, ...style }} />;
}

const card: React.CSSProperties = { background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)' };

/** Grid of product/coupon/bundle-style cards. */
export function SkeletonCards({ count = 6, cols = 3 }: { count?: number; cols?: number }) {
  return (
    <div className="libgrid kpi4" style={{ display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: 16 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ borderRadius: 16, overflow: 'hidden', ...card }}>
          <Skel w="100%" h={140} r={0} />
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Skel w="70%" h={15} />
            <Skel w="45%" h={11} />
            <Skel w="100%" h={36} r={10} style={{ marginTop: 6 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Table header + rows. */
export function SkeletonTable({ rows = 6 }: { rows?: number }) {
  return (
    <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,.08)' }}>
      <div style={{ padding: '14px 16px', background: 'rgba(255,255,255,.04)' }}><Skel w={160} h={11} /></div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '38px 1fr 1fr 100px', gap: 14, alignItems: 'center', padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,.06)' }}>
          <Skel w={36} h={36} r={9} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}><Skel w="55%" h={12} /><Skel w="35%" h={10} /></div>
          <Skel w="50%" h={12} />
          <Skel w={70} h={26} r={8} />
        </div>
      ))}
    </div>
  );
}

/** KPI cards + two panels (dashboard layout). */
export function SkeletonDashboard() {
  return (
    <div>
      <div className="kpi4 statcards" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 18 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ padding: 18, borderRadius: 16, ...card, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Skel w={34} h={34} r={10} />
            <Skel w="60%" h={22} />
            <Skel w="40%" h={11} />
          </div>
        ))}
      </div>
      <div className="col2 dashcols" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16 }}>
        <div style={{ padding: 20, borderRadius: 16, ...card }}><Skel w="40%" h={14} style={{ marginBottom: 16 }} /><Skel w="100%" h={170} r={12} /></div>
        <div style={{ padding: 20, borderRadius: 16, ...card, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Skel w="50%" h={14} />
          {Array.from({ length: 4 }).map((_, i) => <Skel key={i} w="100%" h={34} r={10} />)}
        </div>
      </div>
    </div>
  );
}

/** Simple stacked rows. */
export function SkeletonList({ rows = 5 }: { rows?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', borderRadius: 14, ...card }}>
          <Skel w={44} h={44} r={12} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}><Skel w="40%" h={13} /><Skel w="65%" h={10} /></div>
          <Skel w={90} h={32} r={10} />
        </div>
      ))}
    </div>
  );
}
