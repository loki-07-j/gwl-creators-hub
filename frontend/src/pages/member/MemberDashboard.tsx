import { useState } from 'react';
import { Seo } from '@/components/Seo';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/auth';
import { memberApi } from '@/services/member.service';
import { Loading, ErrorState, EmptyState } from '@/components/ui/States';
import { rupee, shortDate, fullDate, relativeTime, couponDiscount, couponExpiry } from '@/lib/format';

/* ── chrome config ─────────────────────────────────────────────────────── */
const navGroups: { label: string; items: [string, string, string][] }[] = [
  { label: 'Library', items: [['dashboard', '▦', 'Dashboard'], ['products', '📦', 'Products'], ['favourites', '♡', 'Favourites'], ['purchased', '✅', 'Purchased'], ['releases', '✨', 'Latest Releases'], ['bonus', '🎁', 'Bonus Products']] },
  { label: 'Offers', items: [['coupons', '🏷', 'Coupons'], ['membership', '👑', 'Membership']] },
  { label: 'Account', items: [['notifications', '🔔', 'Notifications'], ['support', '💬', 'Support'], ['referral', '🔗', 'Referrals'], ['profile', '👤', 'Profile']] },
];
const SOON = new Set(['membership', 'referral']);
const titles: Record<string, string> = {
  dashboard: 'Dashboard', products: 'Products', favourites: 'Favourites', purchased: 'Purchased', releases: 'Latest Releases', bonus: 'Bonus Products',
  coupons: 'Coupons', membership: 'Membership', notifications: 'Notifications',
  support: 'Support Center', referral: 'Referrals', profile: 'Profile',
};

type Notify = (msg: string, icon?: string) => void;
const card: React.CSSProperties = { background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)' };
const inp: React.CSSProperties = { width: '100%', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 11, padding: '12px 14px', color: '#fff', fontSize: 13.5, outline: 'none' };
const lbl: React.CSSProperties = { display: 'block', fontSize: 12.5, fontWeight: 600, color: '#A8B3C2', marginBottom: 7 };

function openLink(name: string, url: string | null | undefined, notify: Notify) {
  if (url && url !== '#') { try { window.open(url, '_blank'); } catch { /* ignore */ } }
  notify(`Opening ${name} folder…`, '↗');
}
function hasUpdate(p: any): boolean {
  const r = p.releases?.[0];
  return !!r && Date.now() - new Date(r.releasedAt).getTime() < 14 * 864e5;
}

/* ── shell ─────────────────────────────────────────────────────────────── */
export default function MemberDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(''); const [toastIcon, setToastIcon] = useState('✓');
  const notify: Notify = (msg, icon = '✓') => { setToast(msg); setToastIcon(icon); window.clearTimeout((notify as any)._t); (notify as any)._t = window.setTimeout(() => setToast(''), 2400); };

  const { data: notifs } = useQuery({ queryKey: ['member', 'notifications', 'all'], queryFn: () => memberApi.notifications() });
  const unread = (notifs as any[] | undefined)?.filter((n) => !n.read).length ?? 0;

  const initial = user?.name?.[0]?.toUpperCase() ?? 'C';
  function go(v: string) { setView(v); setSidebarOpen(false); window.scrollTo(0, 0); }
  async function doLogout() { await logout(); navigate('/', { replace: true }); }

  return (
    <>
      <Seo title={titles[view]} noindex />
      <div style={{ minHeight: '100vh', display: 'flex' }}>
        <aside className={`dash-sidebar ${sidebarOpen ? 'open' : ''}`} style={{ width: 248, flexShrink: 0, background: '#0d131a', borderRight: '1px solid rgba(255,255,255,.07)', height: '100vh', position: 'sticky', top: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px 20px 16px', display: 'flex', alignItems: 'center', gap: 11, borderBottom: '1px solid rgba(255,255,255,.06)' }}>
            <img src="/assets/gwl-logo.png" alt="GWL" style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'cover' }} />
            <div style={{ lineHeight: 1.1 }}><div style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 15 }}>GWL Hub</div><div style={{ fontSize: 11, color: '#F4C542', fontWeight: 600 }}>Member area</div></div>
          </div>
          <nav style={{ flex: 1, overflowY: 'auto', padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 3 }}>
            {navGroups.map((g) => (
              <div key={g.label}>
                <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#5a6675', padding: '14px 10px 7px' }}>{g.label}</div>
                {g.items.map(([v, icon, label]) => {
                  const active = view === v;
                  const badge = v === 'notifications' && unread ? String(unread) : '';
                  const soon = SOON.has(v);
                  return (
                    <button key={v} onClick={() => go(v)} className="navitem" style={{ cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: '10px 11px', borderRadius: 10, border: 'none', background: active ? 'linear-gradient(95deg,rgba(42,150,166,.22),rgba(42,150,166,.08))' : 'transparent', color: active ? '#fff' : '#A8B3C2', fontFamily: '"Plus Jakarta Sans"', fontWeight: 600, fontSize: 13.5, textAlign: 'left', transition: 'all .18s' }}>
                      <span style={{ width: 20, textAlign: 'center', fontSize: 15 }}>{icon}</span><span style={{ flex: 1 }}>{label}</span>
                      {badge && <span style={{ fontSize: 10, fontWeight: 700, color: '#06222a', background: '#F4C542', padding: '1px 7px', borderRadius: 999 }}>{badge}</span>}
                      {soon && <span style={{ fontSize: 9, fontWeight: 700, color: '#7c8bff', background: 'rgba(124,139,255,.15)', padding: '2px 6px', borderRadius: 999, letterSpacing: '.04em' }}>SOON</span>}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
          <div style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,.06)' }}>
            <button onClick={doLogout} className="navitem" style={{ cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: '10px 11px', borderRadius: 10, border: 'none', background: 'transparent', color: '#ff7b7b', fontFamily: '"Plus Jakarta Sans"', fontWeight: 600, fontSize: 13.5, textAlign: 'left' }}>
              <span style={{ width: 20, textAlign: 'center', fontSize: 15 }}>⎋</span> Logout
            </button>
          </div>
        </aside>
        {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="sb-backdrop" style={{ position: 'fixed', inset: 0, zIndex: 65, background: 'rgba(0,0,0,.5)' }} />}

        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <header className="dash-header" style={{ position: 'sticky', top: 0, zIndex: 40, backdropFilter: 'blur(14px)', background: 'rgba(11,15,20,.8)', borderBottom: '1px solid rgba(255,255,255,.07)', padding: '13px 26px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
              <button onClick={() => setSidebarOpen((v) => !v)} className="menu-btn" style={{ cursor: 'pointer', width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', color: '#fff', fontSize: 17, alignItems: 'center', justifyContent: 'center' }}>☰</button>
              <div style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 19, letterSpacing: '-.02em' }}>{titles[view]}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="topsearch" style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 13px', borderRadius: 11, ...card, minWidth: 200 }}>
                <span style={{ color: '#6b7686', fontSize: 14 }}>🔍</span>
                <input placeholder="Search products, files…" style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: 13.5 }} />
              </div>
              <button onClick={() => go('notifications')} style={{ position: 'relative', cursor: 'pointer', width: 40, height: 40, borderRadius: 11, ...card, color: '#fff', fontSize: 16 }}>🔔{unread > 0 && <span style={{ position: 'absolute', top: 8, right: 9, width: 7, height: 7, borderRadius: '50%', background: '#FF5252', border: '2px solid #0B0F14' }} />}</button>
              <button onClick={() => go('profile')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9, padding: '5px 12px 5px 5px', borderRadius: 999, ...card }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#2A96A6,#F4C542)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Sora', fontWeight: 700, fontSize: 13, color: '#06222a' }}>{initial}</div>
                <span className="member-name" style={{ fontSize: 13, fontWeight: 600 }}>{user?.name}</span>
              </button>
            </div>
          </header>

          <main key={view} className="fade-up dash-main" style={{ flex: 1, padding: '28px 26px 48px', maxWidth: 1160, width: '100%' }}>
            {view === 'dashboard' && <DashboardView name={user?.name ?? ''} go={go} notify={notify} />}
            {view === 'products' && <CatalogView go={go} notify={notify} />}
            {view === 'favourites' && <FavouritesView go={go} notify={notify} />}
            {view === 'purchased' && <PurchasedView notify={notify} />}
            {view === 'releases' && <ReleasesView />}
            {view === 'bonus' && <BonusView notify={notify} />}
            {view === 'coupons' && <CouponsView notify={notify} />}
            {view === 'membership' && <ComingSoonView title="Membership" icon="👑" desc="Lifetime membership perks — member pricing, exclusive bonus drops, early access and priority support — are coming soon." />}
            {view === 'notifications' && <NotificationsView notify={notify} />}
            {view === 'support' && <SupportView notify={notify} />}
            {view === 'referral' && <ComingSoonView title="Referrals" icon="🔗" desc="Invite friends and earn rewards. Our referral program is launching soon — you'll get a unique link and track your earnings right here." />}
            {view === 'profile' && <ProfileView notify={notify} />}
          </main>
        </div>
      </div>

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 95, background: '#1A2430', border: '1px solid rgba(255,255,255,.14)', borderRadius: 13, padding: '13px 20px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 16px 40px -10px rgba(0,0,0,.7)' }}>
          <span style={{ fontSize: 17 }}>{toastIcon}</span><span style={{ fontSize: 13.5, fontWeight: 600 }}>{toast}</span>
        </div>
      )}
      <style>{`
        .menu-btn{display:none}
        @media(max-width:880px){
          .dash-sidebar{position:fixed!important;top:0;z-index:70;transform:translateX(-100%);transition:transform .28s}
          .dash-sidebar.open{transform:translateX(0)!important}.menu-btn{display:flex!important}.topsearch{display:none!important}
          .statcards{grid-template-columns:repeat(2,1fr)!important}.dashcols{grid-template-columns:1fr!important}.libgrid{grid-template-columns:repeat(2,1fr)!important}.couponsgrid{grid-template-columns:1fr!important}
        }
        @media(min-width:881px){.sb-backdrop{display:none!important}}
        @media(max-width:560px){
          .statcards{grid-template-columns:1fr!important}.libgrid{grid-template-columns:1fr!important}
          .member-name{display:none!important}
        }
        @media(max-width:600px){
          .dash-header{padding:11px 16px!important;gap:12px!important}
          .dash-main{padding:20px 16px 40px!important}
          .dash-header > div:first-child{gap:10px!important}
          /* Wide tables scroll horizontally instead of crushing */
          .tablewrap{overflow-x:auto!important}
          .tablerow{min-width:520px!important}
        }
      `}</style>
    </>
  );
}

/* ── Dashboard ─────────────────────────────────────────────────────────── */
function DashboardView({ name, go, notify }: { name: string; go: (v: string) => void; notify: Notify }) {
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['member', 'dashboard'], queryFn: memberApi.dashboard });
  if (isLoading) return <Loading variant="dashboard" />;
  if (isError || !data) return <ErrorState message="Could not load your dashboard." onRetry={() => refetch()} />;
  const s: any = data;
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const cards = [
    { icon: '📦', iconBg: 'rgba(42,150,166,.15)', value: String(s.stats.productsOwned), label: 'Products owned' },
    { icon: '📁', iconBg: 'rgba(124,77,255,.15)', value: s.stats.filesAvailable.toLocaleString('en-IN'), label: 'Files available' },
    { icon: '🏷', iconBg: 'rgba(244,197,66,.15)', value: String(s.stats.activeCoupons), label: 'Active coupons' },
    { icon: '💰', iconBg: 'rgba(0,200,83,.15)', value: rupee(s.stats.lifetimeSaved), label: 'Lifetime savings' },
  ];
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 28, letterSpacing: '-.02em' }}>{greeting}, {name} 👋</div>
        <div style={{ fontSize: 14.5, color: '#A8B3C2', marginTop: 4 }}>Welcome back to GWL Creators Hub. Here's what's new in your hub.</div>
      </div>
      <div className="statcards" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 26 }}>
        {cards.map((c) => (
          <div key={c.label} className="lift" style={{ padding: 18, borderRadius: 16, ...card }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: c.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 12 }}>{c.icon}</div>
            <div style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 26, letterSpacing: '-.02em' }}>{c.value}</div>
            <div style={{ fontSize: 12.5, color: '#A8B3C2', marginTop: 2 }}>{c.label}</div>
          </div>
        ))}
      </div>
      <div className="dashcols" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 18 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ padding: 20, borderRadius: 18, background: 'linear-gradient(135deg,rgba(42,150,166,.12),rgba(244,197,66,.06))', border: '1px solid rgba(255,255,255,.1)' }}>
            <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Jump back in</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 60, height: 60, borderRadius: 13, background: 'rgba(244,197,66,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>🎬</div>
              <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 16 }}>Luxury Videos Hub</div><div style={{ fontSize: 12.5, color: '#A8B3C2' }}>15,000+ videos · last opened 2 days ago</div></div>
              <button onClick={() => openLink('Luxury Videos Hub', '#', notify)} style={{ cursor: 'pointer', fontFamily: 'Sora', fontWeight: 700, fontSize: 13, color: '#06222a', background: '#fff', border: 'none', borderRadius: 10, padding: '10px 16px', whiteSpace: 'nowrap' }}>Open folder ↗</button>
            </div>
          </div>
          <div style={{ padding: 20, borderRadius: 18, ...card }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}><div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 15 }}>Latest releases</div><button onClick={() => go('releases')} style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#36b6c9', fontSize: 12.5, fontWeight: 600 }}>View all →</button></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {s.latestReleases.map((r: any) => (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 11, background: 'rgba(54,182,201,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, flexShrink: 0 }}>{r.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 14, fontWeight: 600 }}>{r.name} <span style={{ fontSize: 11, color: '#6b7686', fontWeight: 500 }}>{r.version}</span></div><div style={{ fontSize: 12, color: '#A8B3C2' }}>{r.note}</div></div>
                  <span style={{ fontSize: 11, color: '#6b7686', whiteSpace: 'nowrap' }}>{relativeTime(r.releasedAt)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ padding: 20, borderRadius: 18, background: 'linear-gradient(135deg,rgba(244,197,66,.14),rgba(42,150,166,.06))', border: '1px solid rgba(244,197,66,.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}><span style={{ fontSize: 20 }}>👑</span><span style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 15 }}>Lifetime Member</span></div>
            <div style={{ fontSize: 12.5, color: '#A8B3C2', lineHeight: 1.5, marginBottom: 14 }}>You've saved <b style={{ color: '#F4C542' }}>{rupee(s.stats.lifetimeSaved)}</b> with member pricing so far. Keep stacking.</div>
            <button onClick={() => go('membership')} style={{ cursor: 'pointer', width: '100%', fontFamily: 'Sora', fontWeight: 700, fontSize: 13, color: '#06222a', background: 'linear-gradient(95deg,#F4C542,#D4A017)', border: 'none', borderRadius: 11, padding: 11 }}>View benefits</button>
          </div>
          <div style={{ padding: 20, borderRadius: 18, ...card }}>
            <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Recent activity</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              {s.recentActivity.map((a: any, i: number) => (
                <div key={i} style={{ display: 'flex', gap: 11 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: ['#00C853', '#2A96A6', '#F4C542', '#7c8bff'][i % 4], marginTop: 5, flexShrink: 0 }} />
                  <div><div style={{ fontSize: 13, color: '#dfe5ee' }}>{a.text}</div><div style={{ fontSize: 11, color: '#6b7686' }}>{relativeTime(a.when)}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Catalog (all products: favourite + buy + redeem code) ─────────────── */
function useCatalog(notify: Notify) {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['member', 'catalog'], queryFn: () => memberApi.catalog() });
  const inval = () => qc.invalidateQueries({ queryKey: ['member'] });
  const fav = useMutation({ mutationFn: (id: string) => memberApi.toggleFavourite(id), onSuccess: (r: any) => { notify(r.favourite ? 'Added to favourites' : 'Removed from favourites', r.favourite ? '❤️' : '🤍'); inval(); }, onError: () => notify('Could not update favourites', '⚠️') });
  const redeem = useMutation({ mutationFn: ({ id, code }: { id: string; code: string }) => memberApi.redeem(id, code), onSuccess: (r: any) => { notify(`${r.name} unlocked — find it in Purchased!`, '🎉'); inval(); }, onError: (e: any) => notify(e?.response?.data?.error?.message ?? 'Could not redeem code', '⚠️') });
  return { q, fav, redeem };
}

function MemberProductCard({ p, fav, redeem, go, notify }: { p: any; fav: any; redeem: any; go: (v: string) => void; notify: Notify }) {
  const [code, setCode] = useState('');
  return (
    <div className="lift" style={{ borderRadius: 16, overflow: 'hidden', ...card, display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'relative', aspectRatio: '16/10', background: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>
        {p.icon}
        {p.purchased && <span style={{ position: 'absolute', top: 10, left: 10, fontSize: 10, fontWeight: 700, color: '#06222a', background: '#00C853', padding: '3px 9px', borderRadius: 999 }}>OWNED</span>}
        <button onClick={() => fav.mutate(p.id)} title={p.favourite ? 'Remove favourite' : 'Add to favourites'} style={{ position: 'absolute', top: 8, right: 8, cursor: 'pointer', width: 34, height: 34, borderRadius: '50%', background: 'rgba(11,15,20,.55)', border: '1px solid rgba(255,255,255,.18)', fontSize: 15, lineHeight: 1 }}>{p.favourite ? '❤️' : '🤍'}</button>
      </div>
      <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 15, marginBottom: 3 }}>{p.name}</div>
        <div style={{ fontSize: 11.5, color: '#6b7686', marginBottom: 10 }}>{p.category} · {p.fileCount.toLocaleString('en-IN')} files · {p.sizeLabel}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
          <span style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 18, color: '#F4C542' }}>{rupee(p.priceOffer)}</span>
          {p.priceOriginal > p.priceOffer && <span style={{ fontSize: 12.5, color: '#6b7686', textDecoration: 'line-through' }}>{rupee(p.priceOriginal)}</span>}
        </div>
        {p.purchased ? (
          <button onClick={() => go('purchased')} style={{ cursor: 'pointer', marginTop: 'auto', fontFamily: 'Sora', fontWeight: 700, fontSize: 12.5, color: '#06222a', background: 'linear-gradient(95deg,#2A96A6,#36b6c9)', border: 'none', borderRadius: 10, padding: 10 }}>Access in Purchased →</button>
        ) : (
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button onClick={() => openLink(p.name, p.paymentLink, notify)} style={{ cursor: 'pointer', fontFamily: 'Sora', fontWeight: 700, fontSize: 12.5, color: '#06222a', background: 'linear-gradient(95deg,#F4C542,#D4A017)', border: 'none', borderRadius: 10, padding: 10 }}>Purchase ↗</button>
            <div style={{ display: 'flex', gap: 6 }}>
              <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter purchase code" style={{ ...inp, padding: '9px 11px', fontSize: 12.5 }} />
              <button disabled={redeem.isPending || !code.trim()} onClick={() => redeem.mutate({ id: p.id, code: code.trim() })} style={{ cursor: 'pointer', fontFamily: 'Sora', fontWeight: 700, fontSize: 12.5, color: '#fff', background: 'rgba(0,200,83,.18)', border: '1px solid rgba(0,200,83,.4)', borderRadius: 10, padding: '9px 13px', whiteSpace: 'nowrap', opacity: !code.trim() ? .5 : 1 }}>Unlock</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CatalogView({ go, notify }: { go: (v: string) => void; notify: Notify }) {
  const [filter, setFilter] = useState('all');
  const { q, fav, redeem } = useCatalog(notify);
  if (q.isLoading) return <Loading />;
  if (q.isError || !q.data) return <ErrorState message="Could not load products." onRetry={() => q.refetch()} />;
  const all = q.data as any[];
  const cats = ['all', ...Array.from(new Set(all.map((p) => p.category)))];
  const products = all.filter((p) => filter === 'all' || p.category === filter);
  const ownedCount = all.filter((p) => p.purchased).length;
  const seg = (active: boolean) => ({ background: active ? 'rgba(42,150,166,.16)' : 'rgba(255,255,255,.04)', border: `1px solid ${active ? 'rgba(42,150,166,.45)' : 'rgba(255,255,255,.1)'}`, color: active ? '#fff' : '#A8B3C2' });
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
        <div style={{ fontSize: 14, color: '#A8B3C2' }}>{all.length} products · you own <b style={{ color: '#fff' }}>{ownedCount}</b>. Buy a product, then unlock it with your purchase code.</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {cats.map((k) => <button key={k} onClick={() => setFilter(k)} style={{ cursor: 'pointer', padding: '8px 14px', borderRadius: 10, fontSize: 12.5, fontWeight: 600, ...seg(filter === k) }}>{k === 'all' ? 'All' : k}</button>)}
        </div>
      </div>
      {products.length === 0 ? <EmptyState icon="📦" title="No products in this category" /> : (
        <div className="libgrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {products.map((p) => <MemberProductCard key={p.id} p={p} fav={fav} redeem={redeem} go={go} notify={notify} />)}
        </div>
      )}
    </div>
  );
}

/* ── Favourites ────────────────────────────────────────────────────────── */
function FavouritesView({ go, notify }: { go: (v: string) => void; notify: Notify }) {
  const { q, fav, redeem } = useCatalog(notify);
  if (q.isLoading) return <Loading />;
  if (q.isError || !q.data) return <ErrorState message="Could not load favourites." onRetry={() => q.refetch()} />;
  const favs = (q.data as any[]).filter((p) => p.favourite);
  return (
    <div>
      <div style={{ fontSize: 14, color: '#A8B3C2', marginBottom: 20 }}>Products you tapped ❤️ in the catalog. {favs.length} saved.</div>
      {favs.length === 0 ? <EmptyState icon="♡" title="No favourites yet" hint="Open Products and tap the heart on any product to save it here." /> : (
        <div className="libgrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {favs.map((p) => <MemberProductCard key={p.id} p={p} fav={fav} redeem={redeem} go={go} notify={notify} />)}
        </div>
      )}
    </div>
  );
}

/* ── Purchased (unlocked products — real download access) ──────────────── */
function PurchasedView({ notify }: { notify: Notify }) {
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['member', 'products'], queryFn: () => memberApi.products() });
  if (isLoading) return <Loading />;
  if (isError || !data) return <ErrorState message="Could not load your purchased products." onRetry={() => refetch()} />;
  const owned = data as any[];
  return (
    <div>
      <div style={{ fontSize: 14, color: '#A8B3C2', marginBottom: 20 }}>You own <b style={{ color: '#fff' }}>{owned.length} products</b> · all with lifetime updates. Tap <b style={{ color: '#dfe5ee' }}>Access</b> to open the download folder.</div>
      {owned.length === 0 ? <EmptyState icon="✅" title="Nothing unlocked yet" hint="Buy a product in Products, then redeem your purchase code to unlock it here." /> : (
        <div className="libgrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {owned.map((p) => (
            <div key={p.id} className="lift" style={{ borderRadius: 16, overflow: 'hidden', ...card, display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'relative', aspectRatio: '16/10', background: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>
                {p.icon}
                {hasUpdate(p) && <span style={{ position: 'absolute', top: 10, right: 10, fontSize: 10, fontWeight: 700, color: '#06222a', background: '#00C853', padding: '3px 9px', borderRadius: 999 }}>UPDATE</span>}
              </div>
              <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 15, marginBottom: 3 }}>{p.name}</div>
                <div style={{ fontSize: 11.5, color: '#6b7686', marginBottom: 12 }}>{p.version} · {p.fileCount.toLocaleString('en-IN')} files · {p.sizeLabel}</div>
                <button onClick={() => openLink(p.name, p.downloadLink, notify)} style={{ cursor: 'pointer', marginTop: 'auto', fontFamily: 'Sora', fontWeight: 700, fontSize: 12.5, color: '#06222a', background: 'linear-gradient(95deg,#2A96A6,#36b6c9)', border: 'none', borderRadius: 10, padding: 10 }}>Access your product ↗</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Coming soon (membership, referrals) ───────────────────────────────── */
function ComingSoonView({ title, icon, desc }: { title: string; icon: string; desc: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '60px 24px', borderRadius: 18, ...card }}>
      <div style={{ width: 76, height: 76, borderRadius: 20, background: 'rgba(124,139,255,.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, marginBottom: 18 }}>{icon}</div>
      <div style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 24, letterSpacing: '-.02em', marginBottom: 8 }}>{title}</div>
      <span style={{ fontSize: 11, fontWeight: 700, color: '#7c8bff', background: 'rgba(124,139,255,.15)', padding: '4px 12px', borderRadius: 999, letterSpacing: '.05em', marginBottom: 16 }}>COMING SOON</span>
      <div style={{ fontSize: 14, color: '#A8B3C2', maxWidth: 440, lineHeight: 1.6 }}>{desc}</div>
    </div>
  );
}

/* ── Downloads ─────────────────────────────────────────────────────────── */
function DownloadsView({ notify }: { notify: Notify }) {
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['member', 'downloads'], queryFn: memberApi.downloads });
  if (isLoading) return <Loading />;
  if (isError || !data) return <ErrorState message="Could not load downloads." onRetry={() => refetch()} />;
  return (
    <div>
      <div style={{ fontSize: 14, color: '#A8B3C2', marginBottom: 18 }}>Your files are hosted on secure folders. Click <b style={{ color: '#dfe5ee' }}>Open folder</b> to access the download link for each product.</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {(data as any[]).map((d) => (
          <div key={d.id} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 16, alignItems: 'center', padding: '16px 18px', borderRadius: 14, ...card }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, background: 'rgba(54,182,201,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{d.icon}</div>
            <div style={{ minWidth: 0 }}><div style={{ fontSize: 14.5, fontWeight: 600 }}>{d.name}</div><div style={{ fontSize: 12, color: '#6b7686' }}>{d.version} · {d.size} · Released {shortDate(d.releasedAt)} · {d.platform}</div></div>
            <button onClick={() => openLink(d.name, d.downloadLink, notify)} style={{ cursor: 'pointer', fontFamily: 'Sora', fontWeight: 700, fontSize: 12.5, color: '#06222a', background: 'linear-gradient(95deg,#2A96A6,#36b6c9)', border: 'none', borderRadius: 10, padding: '10px 16px', whiteSpace: 'nowrap' }}>Open folder ↗</button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Releases ──────────────────────────────────────────────────────────── */
function ReleasesView() {
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['member', 'releases'], queryFn: memberApi.releases });
  if (isLoading) return <Loading />;
  if (isError || !data) return <ErrorState message="Could not load releases." onRetry={() => refetch()} />;
  return (
    <div>
      <div style={{ fontSize: 14, color: '#A8B3C2', marginBottom: 22 }}>Version history and what's new across your products.</div>
      <div style={{ position: 'relative', paddingLeft: 26 }}>
        <div style={{ position: 'absolute', left: 7, top: 6, bottom: 6, width: 2, background: 'rgba(255,255,255,.1)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {(data as any[]).map((r) => (
            <div key={r.id} style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: -26, top: 4, width: 16, height: 16, borderRadius: '50%', background: r.dot ?? '#36b6c9', border: '3px solid #0B0F14' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 15 }}>{r.product?.name}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#36b6c9', background: 'rgba(42,150,166,.14)', padding: '2px 9px', borderRadius: 7 }}>{r.version}</span>
                <span style={{ fontSize: 12, color: '#6b7686' }}>{fullDate(r.releasedAt)}</span>
              </div>
              <div style={{ padding: '14px 16px', borderRadius: 13, ...card }}>
                {r.changes.map((ch: string, i: number) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 13.5, color: '#dfe5ee', marginBottom: 6 }}><span style={{ color: '#00C853', fontSize: 11, marginTop: 3 }}>+</span>{ch}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Bonus ─────────────────────────────────────────────────────────────── */
function BonusView({ notify }: { notify: Notify }) {
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['member', 'bonus'], queryFn: memberApi.bonus });
  if (isLoading) return <Loading />;
  if (isError || !data) return <ErrorState message="Could not load bonus products." onRetry={() => refetch()} />;
  return (
    <div>
      <div style={{ padding: '16px 18px', borderRadius: 14, background: 'linear-gradient(120deg,rgba(244,197,66,.1),rgba(124,77,255,.06))', border: '1px solid rgba(244,197,66,.22)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 22 }}>🎁</span><span style={{ fontSize: 14, color: '#dfe5ee' }}>Exclusive bonus resources, free for members. New drops added every month.</span>
      </div>
      <div className="libgrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        {(data as any[]).map((b) => (
          <div key={b.id} style={{ borderRadius: 16, overflow: 'hidden', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(244,197,66,.18)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ aspectRatio: '16/10', background: b.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38, position: 'relative' }}><span style={{ position: 'absolute', top: 10, left: 10, fontSize: 10, fontWeight: 700, color: '#06222a', background: '#F4C542', padding: '3px 9px', borderRadius: 999 }}>BONUS</span>{b.icon}</div>
            <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 15 }}>{b.name}</div>
              <div style={{ fontSize: 12, color: '#A8B3C2', margin: '4px 0 12px', flex: 1 }}>{b.description}</div>
              <button onClick={() => openLink(b.name, b.downloadLink, notify)} style={{ cursor: 'pointer', fontFamily: 'Sora', fontWeight: 700, fontSize: 12.5, color: '#06222a', background: '#F4C542', border: 'none', borderRadius: 10, padding: 10 }}>Open folder ↗</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Coupons ───────────────────────────────────────────────────────────── */
function CouponsView({ notify }: { notify: Notify }) {
  const [copied, setCopied] = useState('');
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['member', 'coupons'], queryFn: memberApi.coupons });
  if (isLoading) return <Loading />;
  if (isError || !data) return <ErrorState message="Could not load coupons." onRetry={() => refetch()} />;
  const accents = ['#F4C542', '#36b6c9', '#00C853', '#ff7b7b'];
  const copy = (code: string) => { try { navigator.clipboard.writeText(code); } catch { /* ignore */ } setCopied(code); notify('Coupon ' + code + ' copied', '🏷'); };
  return (
    <div>
      <div style={{ fontSize: 14, color: '#A8B3C2', marginBottom: 20 }}>Your member coupons. Some apply automatically at checkout.</div>
      <div className="couponsgrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 }}>
        {(data as any[]).map((c, i) => {
          const accent = accents[i % accents.length];
          return (
            <div key={c.id} style={{ display: 'flex', borderRadius: 16, overflow: 'hidden', border: `1px solid ${accent}33`, background: 'rgba(255,255,255,.04)' }}>
              <div style={{ width: 96, flexShrink: 0, background: `${accent}1a`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 14, borderRight: '2px dashed rgba(255,255,255,.15)' }}>
                <div style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 22, color: accent }}>{couponDiscount(c.type, c.value)}</div>
                <div style={{ fontSize: 10, color: '#A8B3C2', textTransform: 'uppercase', letterSpacing: '.05em' }}>off</div>
              </div>
              <div style={{ flex: 1, padding: '15px 16px', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 14 }}>{c.code}</span>
                  {c.autoApply && <span style={{ fontSize: 9.5, fontWeight: 700, color: '#00C853', background: 'rgba(0,200,83,.12)', padding: '2px 7px', borderRadius: 6 }}>AUTO</span>}
                </div>
                <div style={{ fontSize: 12, color: '#A8B3C2', marginBottom: 12 }}>{c.scopeLabel} · Expires {couponExpiry(c.expiresAt)}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 9, background: 'rgba(0,0,0,.25)', border: '1px dashed rgba(255,255,255,.2)', fontFamily: 'Sora', fontWeight: 700, fontSize: 13, letterSpacing: '.05em' }}>{c.code}</div>
                  <button onClick={() => copy(c.code)} style={{ cursor: 'pointer', fontFamily: 'Sora', fontWeight: 700, fontSize: 12, color: '#06222a', background: accent, border: 'none', borderRadius: 9, padding: '9px 14px' }}>{copied === c.code ? '✓' : 'Copy'}</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Wishlist ──────────────────────────────────────────────────────────── */
function WishlistView({ notify }: { notify: Notify }) {
  const qc = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['member', 'wishlist'], queryFn: memberApi.wishlist });
  const remove = useMutation({ mutationFn: memberApi.removeWishlist, onSuccess: () => { notify('Removed from wishlist', '✕'); qc.invalidateQueries({ queryKey: ['member', 'wishlist'] }); } });
  if (isLoading) return <Loading />;
  if (isError || !data) return <ErrorState message="Could not load wishlist." onRetry={() => refetch()} />;
  const items = data as any[];
  return (
    <div>
      <div style={{ fontSize: 14, color: '#A8B3C2', marginBottom: 20 }}>Products you've saved. Member price applied automatically.</div>
      {items.length === 0 ? <EmptyState icon="♡" title="Your wishlist is empty" hint="Save products to buy later at member pricing." /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map((w) => (
            <div key={w.id} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 16, alignItems: 'center', padding: 16, borderRadius: 14, ...card }}>
              <div style={{ width: 54, height: 54, borderRadius: 13, background: 'rgba(54,182,201,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{w.icon}</div>
              <div>
                <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 15 }}>{w.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                  <span style={{ fontSize: 13, color: '#6b7686', textDecoration: 'line-through' }}>{w.original}</span>
                  <span style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 15, color: '#F4C542' }}>{w.member}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#00C853' }}>member price</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => notify('Opening checkout for ' + w.name, '🛒')} style={{ cursor: 'pointer', fontFamily: 'Sora', fontWeight: 700, fontSize: 12.5, color: '#06222a', background: 'linear-gradient(95deg,#F4C542,#D4A017)', border: 'none', borderRadius: 10, padding: '10px 16px' }}>Buy now</button>
                <button onClick={() => remove.mutate(w.id)} style={{ cursor: 'pointer', width: 40, fontSize: 14, color: '#ff7b7b', background: 'rgba(255,82,82,.08)', border: '1px solid rgba(255,82,82,.2)', borderRadius: 10 }}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Invoices ──────────────────────────────────────────────────────────── */
function InvoicesView({ notify }: { notify: Notify }) {
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['member', 'invoices'], queryFn: memberApi.invoices });
  if (isLoading) return <Loading />;
  if (isError || !data) return <ErrorState message="Could not load invoices." onRetry={() => refetch()} />;
  return (
    <div>
      <div style={{ fontSize: 14, color: '#A8B3C2', marginBottom: 18 }}>Your purchase history and downloadable invoices.</div>
      <div className="tablewrap" style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,.08)' }}>
        <div className="tablerow" style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr 1fr 1fr auto', gap: 14, padding: '14px 18px', background: 'rgba(255,255,255,.04)', fontSize: 11.5, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: '#6b7686' }}>
          <div>Invoice</div><div>Product</div><div>Amount</div><div>Status</div><div /></div>
        {(data as any[]).map((iv) => (
          <div key={iv.id} className="tablerow" style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr 1fr 1fr auto', gap: 14, padding: '15px 18px', borderTop: '1px solid rgba(255,255,255,.06)', alignItems: 'center', fontSize: 13.5 }}>
            <div><div style={{ fontWeight: 600 }}>{iv.invoiceNumber}</div><div style={{ fontSize: 11.5, color: '#6b7686' }}>{fullDate(iv.issuedAt)}</div></div>
            <div style={{ color: '#dfe5ee' }}>{iv.order?.items?.[0]?.label ?? '—'}</div>
            <div style={{ fontFamily: 'Sora', fontWeight: 700 }}>{rupee(iv.amount)}</div>
            <div><span style={{ fontSize: 11, fontWeight: 700, color: '#00C853', background: 'rgba(0,200,83,.12)', padding: '3px 10px', borderRadius: 999 }}>Paid</span></div>
            <button onClick={() => notify('Downloading ' + iv.invoiceNumber + '.pdf', '🧾')} style={{ cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#36b6c9', background: 'rgba(42,150,166,.1)', border: '1px solid rgba(42,150,166,.25)', borderRadius: 9, padding: '8px 13px', whiteSpace: 'nowrap' }}>PDF ⬇</button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Membership ────────────────────────────────────────────────────────── */
const memberPerks = [
  { icon: '💰', title: 'Member pricing', desc: 'Automatic discount on every product, always.' },
  { icon: '🎁', title: 'Bonus drops', desc: 'Exclusive member-only resources every month.' },
  { icon: '⚡', title: 'Early access', desc: 'Get new vaults before everyone else.' },
  { icon: '🔄', title: 'Lifetime updates', desc: 'Every future version, free forever.' },
  { icon: '💬', title: 'Priority support', desc: 'Jump the queue with 2-hour responses.' },
  { icon: '🔗', title: 'Referral rewards', desc: 'Earn ₹100 credit per successful referral.' },
];
function MembershipView() {
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['member', 'membership'], queryFn: memberApi.membership });
  if (isLoading) return <Loading />;
  if (isError || !data) return <ErrorState message="Could not load membership." onRetry={() => refetch()} />;
  const m: any = data;
  return (
    <div>
      <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(244,197,66,.28)', padding: 30, background: 'linear-gradient(135deg,#121821,#0d1a1d)', marginBottom: 20 }}>
        <div style={{ position: 'absolute', top: '-40%', right: '-8%', width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle,rgba(244,197,66,.16),transparent 65%)', filter: 'blur(20px)' }} />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 18 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 13px', borderRadius: 999, background: 'rgba(244,197,66,.14)', border: '1px solid rgba(244,197,66,.35)', marginBottom: 14 }}><span style={{ fontSize: 14 }}>👑</span><span style={{ fontSize: 12.5, fontWeight: 700, color: '#F4C542' }}>Lifetime Member</span></div>
            <div style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 26, letterSpacing: '-.02em' }}>You're a lifetime member</div>
            <div style={{ fontSize: 14, color: '#A8B3C2', marginTop: 6 }}>Member since {fullDate(m.memberSince)} · No renewals, ever</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12.5, color: '#A8B3C2' }}>Lifetime savings</div>
            <div style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 34, color: '#F4C542' }}>{rupee(m.lifetimeSaved)}</div>
          </div>
        </div>
      </div>
      <div className="statcards" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
        {memberPerks.map((p) => (
          <div key={p.title} style={{ padding: 18, borderRadius: 15, ...card }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(244,197,66,.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 12 }}>{p.icon}</div>
            <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 14.5, marginBottom: 4 }}>{p.title}</div>
            <div style={{ fontSize: 12.5, color: '#A8B3C2', lineHeight: 1.5 }}>{p.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Notifications ─────────────────────────────────────────────────────── */
function NotificationsView({ notify }: { notify: Notify }) {
  const qc = useQueryClient();
  const [filter, setFilter] = useState('all');
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['member', 'notifications', filter], queryFn: () => memberApi.notifications(filter === 'all' ? undefined : filter) });
  const markAll = useMutation({ mutationFn: memberApi.markAllRead, onSuccess: () => { notify('All notifications marked read', '✓'); qc.invalidateQueries({ queryKey: ['member', 'notifications'] }); } });
  const markOne = useMutation({ mutationFn: memberApi.markRead, onSuccess: () => qc.invalidateQueries({ queryKey: ['member', 'notifications'] }) });
  const filters: [string, string][] = [['all', 'All'], ['PRODUCTS', 'Products'], ['OFFERS', 'Offers']];
  const seg = (active: boolean) => ({ background: active ? 'rgba(42,150,166,.16)' : 'rgba(255,255,255,.04)', border: `1px solid ${active ? 'rgba(42,150,166,.45)' : 'rgba(255,255,255,.1)'}`, color: active ? '#fff' : '#A8B3C2' });
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {filters.map(([k, label]) => <button key={k} onClick={() => setFilter(k)} style={{ cursor: 'pointer', padding: '8px 14px', borderRadius: 10, fontSize: 12.5, fontWeight: 600, ...seg(filter === k) }}>{label}</button>)}
        </div>
        <button onClick={() => markAll.mutate()} style={{ cursor: 'pointer', fontSize: 12.5, fontWeight: 600, color: '#36b6c9', background: 'none', border: 'none' }}>✓ Mark all read</button>
      </div>
      {isLoading ? <Loading /> : isError || !data ? <ErrorState message="Could not load notifications." onRetry={() => refetch()} /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(data as any[]).length === 0 ? <EmptyState icon="🔔" title="No notifications" /> : (data as any[]).map((n) => (
            <div key={n.id} onClick={() => n.read || markOne.mutate(n.id)} style={{ cursor: n.read ? 'default' : 'pointer', display: 'flex', gap: 13, alignItems: 'flex-start', padding: '15px 17px', borderRadius: 14, background: n.read ? 'rgba(255,255,255,.03)' : 'rgba(42,150,166,.06)', border: `1px solid ${n.read ? 'rgba(255,255,255,.07)' : 'rgba(42,150,166,.18)'}` }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: n.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{n.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 14, fontWeight: 600 }}>{n.title}</span>{!n.read && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#2A96A6' }} />}</div>
                <div style={{ fontSize: 13, color: '#A8B3C2', marginTop: 2 }}>{n.body}</div>
              </div>
              <span style={{ fontSize: 11.5, color: '#6b7686', whiteSpace: 'nowrap' }}>{relativeTime(n.createdAt)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Referral ──────────────────────────────────────────────────────────── */
function ReferralView({ notify }: { notify: Notify }) {
  const [copied, setCopied] = useState(false);
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['member', 'referral'], queryFn: memberApi.referral });
  if (isLoading) return <Loading />;
  if (isError || !data) return <ErrorState message="Could not load referrals." onRetry={() => refetch()} />;
  const r: any = data;
  const statCards = [
    { value: String(r.stats.successful), label: 'Successful referrals', color: '#00C853' },
    { value: rupee(r.stats.earned), label: 'Rewards earned', color: '#F4C542' },
    { value: String(r.stats.pending), label: 'Pending', color: '#36b6c9' },
    { value: '#' + r.stats.rank, label: 'Leaderboard rank', color: '#7c8bff' },
  ];
  const colors = ['#2A96A6', '#D4A017', '#7c4dff', '#00C853'];
  const copy = () => { try { navigator.clipboard.writeText(r.link); } catch { /* ignore */ } setCopied(true); notify('Referral link copied', '🔗'); };
  return (
    <div>
      <div className="dashcols" style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 18, marginBottom: 20 }}>
        <div style={{ padding: 24, borderRadius: 18, background: 'linear-gradient(135deg,rgba(42,150,166,.12),rgba(244,197,66,.06))', border: '1px solid rgba(255,255,255,.1)' }}>
          <div style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 20, marginBottom: 8 }}>Invite friends, earn rewards</div>
          <div style={{ fontSize: 13.5, color: '#A8B3C2', lineHeight: 1.5, marginBottom: 18 }}>Give friends 10% off their first purchase. You earn ₹100 credit for every successful referral.</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#A8B3C2', marginBottom: 7 }}>Your referral link</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '12px 14px', borderRadius: 11, background: 'rgba(0,0,0,.25)', border: '1px solid rgba(255,255,255,.12)', fontSize: 13, color: '#dfe5ee', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{r.link}</div>
            <button onClick={copy} style={{ cursor: 'pointer', fontFamily: 'Sora', fontWeight: 700, fontSize: 13, color: '#06222a', background: 'linear-gradient(95deg,#2A96A6,#36b6c9)', border: 'none', borderRadius: 11, padding: '0 18px', whiteSpace: 'nowrap' }}>{copied ? '✓ Copied' : 'Copy'}</button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignContent: 'start' }}>
          {statCards.map((s) => (
            <div key={s.label} style={{ padding: 18, borderRadius: 15, ...card }}>
              <div style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 24, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#A8B3C2', marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: 20, borderRadius: 18, ...card }}>
        <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Recent referrals</div>
        {r.referrals.length === 0 ? <EmptyState icon="🔗" title="No referrals yet" hint="Share your link to start earning." /> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {r.referrals.map((rl: any, i: number) => {
              const rewarded = rl.status === 'REWARDED';
              return (
                <div key={rl.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: colors[i % colors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Sora', fontWeight: 700, fontSize: 13 }}>{rl.refereeName[0]?.toUpperCase()}</div>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 13.5, fontWeight: 600 }}>{rl.refereeName}</div><div style={{ fontSize: 11.5, color: '#6b7686' }}>Joined {relativeTime(rl.createdAt)}</div></div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: rewarded ? '#00C853' : '#F4C542', background: rewarded ? 'rgba(0,200,83,.12)' : 'rgba(244,197,66,.12)', padding: '3px 10px', borderRadius: 999 }}>{rewarded ? 'Rewarded' : 'Pending'}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Support ───────────────────────────────────────────────────────────── */
const supportChannels = [
  { icon: '💬', bg: 'rgba(0,200,83,.15)', title: 'WhatsApp', desc: 'Fastest way to reach us.', cta: 'Open chat' },
  { icon: '✉️', bg: 'rgba(42,150,166,.15)', title: 'Email', desc: 'hi@gwlhub.com', cta: 'Send email' },
  { icon: '📚', bg: 'rgba(244,197,66,.15)', title: 'Knowledge base', desc: 'Browse FAQs & guides.', cta: 'Browse' },
];
function SupportView({ notify }: { notify: Notify }) {
  const [type, setType] = useState('BUG');
  const [product, setProduct] = useState('Luxury Videos Hub');
  const [message, setMessage] = useState('');
  const submit = useMutation({
    mutationFn: () => memberApi.createTicket({ type, product, message }),
    onSuccess: () => { notify("Ticket submitted — we'll reply within 2 hours", '✅'); setMessage(''); },
    onError: () => notify('Please describe your issue (min 5 chars)', '⚠️'),
  });
  return (
    <div>
      <div style={{ fontSize: 14, color: '#A8B3C2', marginBottom: 20 }}>We typically reply within 2 hours during business hours.</div>
      <div className="statcards" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }}>
        {supportChannels.map((sc) => (
          <div key={sc.title} className="lift" style={{ padding: 20, borderRadius: 16, ...card }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: sc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 13 }}>{sc.icon}</div>
            <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{sc.title}</div>
            <div style={{ fontSize: 12.5, color: '#A8B3C2', marginBottom: 14 }}>{sc.desc}</div>
            <button onClick={() => notify(`Opening ${sc.title}…`, sc.icon)} style={{ cursor: 'pointer', fontFamily: 'Sora', fontWeight: 700, fontSize: 12.5, color: '#fff', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.14)', borderRadius: 10, padding: '9px 16px' }}>{sc.cta}</button>
          </div>
        ))}
      </div>
      <div style={{ padding: 22, borderRadius: 18, ...card }}>
        <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Raise a support ticket</div>
        <div className="dashcols" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <select value={type} onChange={(e) => setType(e.target.value)} style={{ ...inp, padding: '12px 14px' }}>
            <option value="BUG">Bug report</option><option value="FEATURE">Feature request</option><option value="BUSINESS">Business inquiry</option><option value="GENERAL">General support</option>
          </select>
          <select value={product} onChange={(e) => setProduct(e.target.value)} style={{ ...inp, padding: '12px 14px' }}>
            <option>Luxury Videos Hub</option><option>Ideas Hub</option><option>Websites Hub</option><option>Creators Research Hub</option><option>Shortcuts Hub</option><option>Other</option>
          </select>
        </div>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe your issue…" rows={4} style={{ ...inp, resize: 'none', marginBottom: 12 }} />
        <button disabled={submit.isPending} onClick={() => submit.mutate()} style={{ cursor: 'pointer', fontFamily: 'Sora', fontWeight: 700, fontSize: 14, color: '#06222a', background: 'linear-gradient(95deg,#2A96A6,#36b6c9)', border: 'none', borderRadius: 12, padding: '13px 24px' }}>Submit ticket</button>
      </div>
    </div>
  );
}

/* ── Profile ───────────────────────────────────────────────────────────── */
function ProfileView({ notify }: { notify: Notify }) {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['member', 'profile'], queryFn: memberApi.getProfile });
  const [form, setForm] = useState<Record<string, string>>({});
  const save = useMutation({
    mutationFn: () => memberApi.updateProfile({ name: form.name, country: form.country, phone: form.phone }),
    onSuccess: () => { notify('Profile saved', '✓'); qc.invalidateQueries({ queryKey: ['member', 'profile'] }); },
    onError: () => notify('Could not save profile', '⚠️'),
  });
  if (isLoading) return <Loading />;
  if (isError || !data) return <ErrorState message="Could not load your profile." onRetry={() => refetch()} />;
  const p: any = data;
  const f = (k: string, fallback = '') => form[k] ?? p[k] ?? fallback;
  const fields: [string, string, boolean][] = [['name', 'Full name', false], ['email', 'Email address', true], ['country', 'Country', false], ['phone', 'Phone', false]];
  const initial = (user?.name ?? p.name)?.[0]?.toUpperCase() ?? 'C';
  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: 22, borderRadius: 18, ...card, marginBottom: 18 }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#2A96A6,#F4C542)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Sora', fontWeight: 800, fontSize: 28, color: '#06222a' }}>{initial}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 20 }}>{f('name')}</div>
          <div style={{ fontSize: 13.5, color: '#A8B3C2' }}>{p.email} · 🇮🇳 {f('country', 'India')}</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 7, padding: '4px 11px', borderRadius: 999, background: 'rgba(244,197,66,.14)', border: '1px solid rgba(244,197,66,.3)', fontSize: 11.5, fontWeight: 700, color: '#F4C542' }}>👑 Lifetime Member</div>
        </div>
        <button onClick={() => notify('Photo upload coming soon', '📷')} style={{ cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#fff', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.14)', borderRadius: 10, padding: '10px 16px' }}>Change photo</button>
      </div>
      <div style={{ padding: 22, borderRadius: 18, ...card }}>
        <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 16, marginBottom: 18 }}>Account details</div>
        <div className="dashcols" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {fields.map(([key, label, disabled]) => (
            <div key={key}>
              <label style={lbl}>{label}</label>
              <input value={f(key)} disabled={disabled} onChange={(e) => setForm((s) => ({ ...s, [key]: e.target.value }))} style={{ ...inp, opacity: disabled ? 0.6 : 1 }} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button disabled={save.isPending} onClick={() => save.mutate()} style={{ cursor: 'pointer', fontFamily: 'Sora', fontWeight: 700, fontSize: 13.5, color: '#06222a', background: 'linear-gradient(95deg,#2A96A6,#36b6c9)', border: 'none', borderRadius: 11, padding: '12px 22px' }}>Save changes</button>
          <button onClick={() => setForm({})} style={{ cursor: 'pointer', fontSize: 13.5, fontWeight: 600, color: '#A8B3C2', background: 'none', border: 'none' }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
