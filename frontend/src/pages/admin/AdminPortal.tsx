import { useState, useMemo, useEffect, useRef } from 'react';
import { Seo } from '@/components/Seo';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/auth';
import { adminApi } from '@/services/admin.service';
import { Loading, ErrorState, EmptyState } from '@/components/ui/States';
import { rupee, lakh, relativeTime, statusPill, prettyStatus, couponDiscount, couponExpiry, stars } from '@/lib/format';

/* ── chrome config ─────────────────────────────────────────────────────── */
const nav: { label: string; items: [string, string, string][] }[] = [
  { label: 'OVERVIEW', items: [['dashboard', '▦', 'Dashboard']] },
  { label: 'CATALOG', items: [['products', '📦', 'Products'], ['bundles', '🎁', 'Bundles']] },
  { label: 'SALES', items: [['customers', '👥', 'Members'], ['coupons', '🏷', 'Coupons']] },
  { label: 'CONTENT', items: [['landing', '🎨', 'Landing Page'], ['testimonials', '⭐', 'Testimonials'], ['announcements', '📢', 'Announcements'], ['faqs', '❓', 'FAQs']] },
  { label: 'SYSTEM', items: [['rbac', '🛡', 'Users & Roles'], ['audit', '📜', 'Audit Logs'], ['seo', '🔍', 'SEO'], ['settings', '⚙', 'Settings']] },
];
const titles: Record<string, [string, string]> = {
  dashboard: ['Dashboard', 'Overview of your store performance'], products: ['Products', 'Manage your catalog'], editor: ['Product editor', 'Create or edit a product'],
  bundles: ['Bundles', 'Combine products to raise order value'],
  customers: ['Members', 'People who created a login — edit, deactivate or block'], coupons: ['Coupons', 'Discount codes & auto-apply rules'], landing: ['Landing Page CMS', 'Edit the public homepage'],
  testimonials: ['Testimonials', 'Customer reviews & social proof'], announcements: ['Announcements', 'Global announcement bar'], faqs: ['FAQs', 'Help content shown across the site'],
  rbac: ['Users & Roles', 'Team access and permissions'], audit: ['Audit Logs', 'Security & activity trail'], seo: ['SEO', 'Search & social metadata'], settings: ['Settings', 'Store configuration'],
};

type Notify = (msg: string, icon?: string) => void;
const card: React.CSSProperties = { background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)' };
const inp: React.CSSProperties = { width: '100%', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 10, padding: '11px 13px', color: '#fff', fontSize: 13, outline: 'none' };
const lbl: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: '#A8B3C2', marginBottom: 6 };
const primaryBtn: React.CSSProperties = { cursor: 'pointer', fontFamily: 'Sora', fontWeight: 700, fontSize: 13.5, color: '#06222a', background: 'linear-gradient(95deg,#2A96A6,#36b6c9)', border: 'none', borderRadius: 11, padding: '11px 18px' };

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ cursor: 'pointer', width: 44, height: 25, borderRadius: 999, border: 'none', background: on ? '#00C853' : 'rgba(255,255,255,.15)', position: 'relative', flexShrink: 0, transition: 'background .2s' }}>
      <span style={{ position: 'absolute', top: 3, left: on ? 22 : 3, width: 19, height: 19, borderRadius: '50%', background: '#fff', transition: 'left .2s' }} />
    </button>
  );
}
function Pill({ status }: { status: string }) {
  const [c, b] = statusPill(status);
  return <span style={{ fontSize: 11, fontWeight: 700, color: c, background: b, padding: '3px 10px', borderRadius: 999, width: 'fit-content' }}>{prettyStatus(status)}</span>;
}

/* ── Signup link generator + history (header) ──────────────────────────── */
const inviteLink = (token: string) => `${window.location.origin}/signup/${token}`;
function expiresInLabel(expiresAt: string) {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return 'expired';
  const h = Math.floor(ms / 3.6e6);
  const m = Math.floor((ms % 3.6e6) / 6e4);
  return h >= 1 ? `expires in ${h}h ${m}m` : `expires in ${m}m`;
}

function SignupLinkButton({ notify }: { notify: Notify }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'MEMBER' | 'ADMIN'>('MEMBER');
  const [link, setLink] = useState('');
  const { data: history } = useQuery({ queryKey: ['admin', 'invites'], queryFn: adminApi.listInvites, enabled: open });
  const copyLink = (url: string) => { try { navigator.clipboard.writeText(url); notify('Signup link copied', '🔗'); } catch { /* ignore */ } };
  const gen = useMutation({
    mutationFn: () => adminApi.createInvite(email.trim(), role),
    onSuccess: (r: any) => {
      const url = inviteLink(r.token);
      setLink(url); copyLink(url); setEmail('');
      qc.invalidateQueries({ queryKey: ['admin', 'invites'] });
    },
    onError: (e: any) => notify(e?.response?.data?.error?.message ?? 'Could not create signup link', '⚠️'),
  });
  const close = () => { setOpen(false); setLink(''); };
  const validEmail = /^\S+@\S+\.\S+$/.test(email.trim());
  const list = (history as any[] | undefined) ?? [];
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen((o) => !o)} title="Create a signup link" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, padding: '8px 13px', borderRadius: 999, background: 'rgba(42,150,166,.14)', border: '1px solid rgba(42,150,166,.4)', color: '#36b6c9', fontFamily: '"Plus Jakarta Sans"', fontWeight: 700, fontSize: 12.5, whiteSpace: 'nowrap' }}>🔗 <span className="signup-label">Signup link</span></button>
      {open && (
        <>
          <div onClick={close} style={{ position: 'fixed', inset: 0, zIndex: 80 }} />
          <div style={{ position: 'absolute', top: 46, right: 0, zIndex: 81, width: 344, maxHeight: '80vh', overflowY: 'auto', padding: 18, borderRadius: 16, background: '#0d131a', border: '1px solid rgba(255,255,255,.12)', boxShadow: '0 24px 60px -16px rgba(0,0,0,.8)' }}>
            <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 14.5, marginBottom: 4 }}>Create signup link</div>
            <div style={{ fontSize: 12, color: '#6b7686', marginBottom: 14 }}>One-time invite for a new account · valid for <b style={{ color: '#A8B3C2' }}>24 hours</b>.</div>
            <label style={lbl}>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="person@email.com" style={{ ...inp, marginBottom: 12 }} />
            <label style={lbl}>Account type</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {(['MEMBER', 'ADMIN'] as const).map((r) => (
                <button key={r} onClick={() => setRole(r)} style={{ cursor: 'pointer', flex: 1, padding: '9px 0', borderRadius: 10, fontSize: 12.5, fontWeight: 700, background: role === r ? 'rgba(42,150,166,.18)' : 'rgba(255,255,255,.04)', border: `1px solid ${role === r ? 'rgba(42,150,166,.45)' : 'rgba(255,255,255,.1)'}`, color: role === r ? '#fff' : '#A8B3C2' }}>{r === 'MEMBER' ? 'Member' : 'Admin'}</button>
              ))}
            </div>
            <button disabled={gen.isPending || !validEmail} onClick={() => gen.mutate()} style={{ ...primaryBtn, width: '100%', opacity: !validEmail ? .5 : 1 }}>{gen.isPending ? 'Generating…' : '🔗 Generate & copy link'}</button>
            {link && (
              <div style={{ marginTop: 14 }}>
                <label style={lbl}>Signup link (copied)</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input readOnly value={link} onFocus={(e) => e.target.select()} style={{ ...inp, fontSize: 11.5 }} />
                  <button onClick={() => copyLink(link)} title="Copy" style={{ cursor: 'pointer', flexShrink: 0, width: 40, borderRadius: 10, background: 'rgba(0,200,83,.16)', border: '1px solid rgba(0,200,83,.4)', color: '#00C853', fontSize: 14 }}>⧉</button>
                </div>
              </div>
            )}

            <div style={{ height: 1, background: 'rgba(255,255,255,.08)', margin: '16px 0 12px' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 13 }}>Recent links</div>
              <span style={{ fontSize: 10.5, color: '#6b7686' }}>last 10 · auto-removed after 24h</span>
            </div>
            {list.length === 0 ? (
              <div style={{ fontSize: 12, color: '#6b7686', padding: '8px 0' }}>No active signup links yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {list.map((iv) => (
                  <div key={iv.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 10px', borderRadius: 10, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)' }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{iv.email}</div>
                      <div style={{ fontSize: 10.5, color: '#6b7686' }}>{iv.used ? 'used' : expiresInLabel(iv.expiresAt)}</div>
                    </div>
                    <span style={{ fontSize: 9.5, fontWeight: 700, color: iv.role === 'ADMIN' ? '#F4C542' : '#36b6c9', background: iv.role === 'ADMIN' ? 'rgba(244,197,66,.14)' : 'rgba(54,182,201,.14)', padding: '2px 7px', borderRadius: 999 }}>{iv.role === 'ADMIN' ? 'ADMIN' : 'MEMBER'}</span>
                    {iv.used
                      ? <span title="Already used" style={{ width: 30, textAlign: 'center', fontSize: 13, color: '#6b7686' }}>✓</span>
                      : <button onClick={() => copyLink(inviteLink(iv.token))} title="Copy link" style={{ cursor: 'pointer', flexShrink: 0, width: 30, height: 30, borderRadius: 8, background: 'rgba(42,150,166,.14)', border: '1px solid rgba(42,150,166,.35)', color: '#36b6c9', fontSize: 13 }}>⧉</button>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Reusable CRUD modal ───────────────────────────────────────────────── */
type FieldType = 'text' | 'textarea' | 'number' | 'select' | 'toggle' | 'date' | 'multiselect';
interface CrudField { key: string; label: string; type?: FieldType; span?: 1 | 2; options?: { value: string; label: string }[]; placeholder?: string }

function RowActions({ onEdit, onDelete }: { onEdit?: () => void; onDelete?: () => void }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {onEdit && <button onClick={onEdit} title="Edit" style={{ cursor: 'pointer', width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', color: '#fff', fontSize: 13 }}>✏</button>}
      {onDelete && <button onClick={onDelete} title="Delete" style={{ cursor: 'pointer', width: 32, height: 32, borderRadius: 8, background: 'rgba(255,82,82,.1)', border: '1px solid rgba(255,82,82,.3)', color: '#ff7b7b', fontSize: 13 }}>🗑</button>}
    </div>
  );
}

function CrudModal({ title, fields, initial, onClose, onSubmit, submitting }: { title: string; fields: CrudField[]; initial: Record<string, any>; onClose: () => void; onSubmit: (v: Record<string, any>) => void; submitting?: boolean }) {
  const [form, setForm] = useState<Record<string, any>>(initial);
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));
  function submit() {
    const out: Record<string, any> = {};
    for (const f of fields) {
      let v = form[f.key];
      if (f.type === 'number') v = v === '' || v == null ? 0 : Number(v);
      else if (f.type === 'toggle') v = !!v;
      else if (f.type === 'date') v = v ? new Date(v).toISOString() : null;
      else if (f.type === 'multiselect') v = Array.isArray(v) ? v : [];
      out[f.key] = v;
    }
    onSubmit(out);
  }
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, overflowY: 'auto' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 'min(540px,100%)', maxHeight: '90vh', overflowY: 'auto', background: '#0d131a', border: '1px solid rgba(255,255,255,.12)', borderRadius: 18, padding: 24, boxShadow: '0 30px 80px -20px rgba(0,0,0,.8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 18 }}>{title}</div>
          <button onClick={onClose} style={{ cursor: 'pointer', width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', color: '#fff', fontSize: 15 }}>✕</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {fields.map((f) => {
            const v = form[f.key];
            return (
              <div key={f.key} style={{ gridColumn: (f.span ?? 1) === 2 ? 'span 2' : 'span 1' }}>
                <label style={lbl}>{f.label}</label>
                {f.type === 'textarea' ? (
                  <textarea rows={3} value={v ?? ''} onChange={(e) => set(f.key, e.target.value)} placeholder={f.placeholder} style={{ ...inp, resize: 'vertical' }} />
                ) : f.type === 'select' ? (
                  <select value={v ?? ''} onChange={(e) => set(f.key, e.target.value)} style={inp}>
                    {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ) : f.type === 'toggle' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}><Toggle on={!!v} onClick={() => set(f.key, !v)} /><span style={{ fontSize: 12.5, color: '#A8B3C2' }}>{v ? 'Yes' : 'No'}</span></div>
                ) : f.type === 'date' ? (
                  <input type="date" value={v ? String(v).slice(0, 10) : ''} onChange={(e) => set(f.key, e.target.value)} style={inp} />
                ) : f.type === 'multiselect' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 180, overflowY: 'auto', padding: 10, borderRadius: 10, border: '1px solid rgba(255,255,255,.12)', background: 'rgba(255,255,255,.04)' }}>
                    {f.options?.map((o) => {
                      const arr: string[] = Array.isArray(v) ? v : [];
                      const on = arr.includes(o.value);
                      return (
                        <label key={o.value} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, cursor: 'pointer' }}>
                          <input type="checkbox" checked={on} onChange={() => set(f.key, on ? arr.filter((x) => x !== o.value) : [...arr, o.value])} />
                          {o.label}
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <input type={f.type === 'number' ? 'number' : 'text'} value={v ?? ''} onChange={(e) => set(f.key, e.target.value)} placeholder={f.placeholder} style={inp} />
                )}
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
          <button onClick={onClose} style={{ cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#fff', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.14)', borderRadius: 10, padding: '10px 16px' }}>Cancel</button>
          <button disabled={submitting} onClick={submit} style={{ ...primaryBtn, opacity: submitting ? .6 : 1 }}>{submitting ? 'Saving…' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
}

const COUPON_FIELDS: CrudField[] = [
  { key: 'code', label: 'Code', span: 2, placeholder: 'SAVE20' },
  { key: 'type', label: 'Type', type: 'select', options: [{ value: 'PERCENT', label: 'Percent (%)' }, { value: 'FIXED', label: 'Fixed (₹)' }] },
  { key: 'value', label: 'Value', type: 'number' },
  { key: 'scope', label: 'Scope', type: 'select', options: [{ value: 'ALL_PRODUCTS', label: 'All products' }, { value: 'ALL_BUNDLES', label: 'All bundles' }, { value: 'PRODUCT', label: 'Specific product' }, { value: 'FIRST_ORDER', label: 'First order' }, { value: 'REFERRAL', label: 'Referrals' }] },
  { key: 'scopeLabel', label: 'Scope label', span: 2, placeholder: 'All products' },
  { key: 'expiresAt', label: 'Expiry date (optional)', type: 'date', span: 2 },
  { key: 'autoApply', label: 'Auto-apply at checkout', type: 'toggle' },
  { key: 'active', label: 'Active', type: 'toggle' },
];
const TESTIMONIAL_FIELDS: CrudField[] = [
  { key: 'name', label: 'Customer name', span: 2 },
  { key: 'text', label: 'Review', type: 'textarea', span: 2 },
  { key: 'stars', label: 'Stars', type: 'select', options: [5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: `${n} ★` })) },
  { key: 'avatarBg', label: 'Avatar colour', placeholder: '#2A96A6' },
  { key: 'sortOrder', label: 'Sort order', type: 'number' },
  { key: 'published', label: 'Published', type: 'toggle' },
];
const ANNOUNCEMENT_FIELDS: CrudField[] = [
  { key: 'message', label: 'Message', span: 2 },
  { key: 'type', label: 'Type', type: 'select', options: ['SALE', 'MAINTENANCE', 'UPDATE', 'HOLIDAY'].map((t) => ({ value: t, label: prettyStatus(t) })) },
  { key: 'schedule', label: 'Schedule', placeholder: 'Now → 30 Jun' },
  { key: 'active', label: 'Live', type: 'toggle' },
  { key: 'sortOrder', label: 'Sort order', type: 'number' },
];
const FAQ_FIELDS: CrudField[] = [
  { key: 'question', label: 'Question', span: 2 },
  { key: 'answer', label: 'Answer', type: 'textarea', span: 2 },
  { key: 'category', label: 'Category', placeholder: 'General' },
  { key: 'sortOrder', label: 'Sort order', type: 'number' },
  { key: 'published', label: 'Published', type: 'toggle' },
];

/* ── Portal shell ──────────────────────────────────────────────────────── */
export default function AdminPortal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState(''); const [toastIcon, setToastIcon] = useState('✓');
  const notify: Notify = (msg, icon = '✓') => { setToast(msg); setToastIcon(icon); window.clearTimeout((notify as any)._t); (notify as any)._t = window.setTimeout(() => setToast(''), 2300); };

  const initial = user?.name?.[0]?.toUpperCase() ?? 'A';
  const [title, sub] = titles[view] ?? titles.dashboard;

  function go(v: string) { setView(v); setSidebarOpen(false); window.scrollTo(0, 0); }
  function openEditor(id: string | null) { setEditingId(id); go('editor'); }
  async function doLogout() { await logout(); navigate('/', { replace: true }); }

  return (
    <>
      <Seo title={`${title} · Admin`} noindex />
      <div style={{ minHeight: '100vh', display: 'flex' }}>
        <aside className={`dash-sidebar ${sidebarOpen ? 'open' : ''}`} style={{ width: 248, flexShrink: 0, background: '#0d131a', borderRight: '1px solid rgba(255,255,255,.07)', height: '100vh', position: 'sticky', top: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px 20px 16px', display: 'flex', alignItems: 'center', gap: 11, borderBottom: '1px solid rgba(255,255,255,.06)' }}>
            <img src="/assets/gwl-logo.png" alt="GWL" style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'cover' }} />
            <div style={{ lineHeight: 1.1 }}><div style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 15 }}>GWL Admin</div><div style={{ fontSize: 11, color: '#36b6c9', fontWeight: 600 }}>Control center</div></div>
          </div>
          <nav style={{ flex: 1, overflowY: 'auto', padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 3 }}>
            {nav.map((g) => (
              <div key={g.label}>
                <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#5a6675', padding: '14px 10px 7px' }}>{g.label}</div>
                {g.items.map(([v, icon, label]) => {
                  const active = view === v || (v === 'products' && view === 'editor');
                  return (
                    <button key={v} onClick={() => go(v)} className="navitem" style={{ cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: '10px 11px', borderRadius: 10, border: 'none', background: active ? 'linear-gradient(95deg,rgba(42,150,166,.22),rgba(42,150,166,.07))' : 'transparent', color: active ? '#fff' : '#A8B3C2', fontFamily: '"Plus Jakarta Sans"', fontWeight: 600, fontSize: 13.5, textAlign: 'left', transition: 'all .18s' }}>
                      <span style={{ width: 20, textAlign: 'center', fontSize: 15 }}>{icon}</span><span style={{ flex: 1 }}>{label}</span>
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
          <header style={{ position: 'sticky', top: 0, zIndex: 40, backdropFilter: 'blur(14px)', background: 'rgba(11,15,20,.8)', borderBottom: '1px solid rgba(255,255,255,.07)', padding: '13px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
              <button onClick={() => setSidebarOpen((v) => !v)} className="menu-btn" style={{ cursor: 'pointer', width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', color: '#fff', fontSize: 17, alignItems: 'center', justifyContent: 'center' }}>☰</button>
              <div style={{ minWidth: 0 }}><div style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 19, letterSpacing: '-.02em' }}>{title}</div><div style={{ fontSize: 12.5, color: '#6b7686' }}>{sub}</div></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <SignupLinkButton notify={notify} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '5px 12px 5px 5px', borderRadius: 999, ...card }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#7c4dff,#2A96A6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Sora', fontWeight: 700, fontSize: 13, color: '#fff' }}>{initial}</div>
                <span className="admin-name" style={{ fontSize: 13, fontWeight: 600 }}>{user?.name}</span>
              </div>
            </div>
          </header>

          <main key={view} className="fade-up" style={{ flex: 1, padding: '24px', maxWidth: 1280, width: '100%' }}>
            {view === 'dashboard' && <DashboardView />}
            {view === 'products' && <ProductsView openEditor={openEditor} notify={notify} />}
            {view === 'editor' && <EditorView id={editingId} go={go} notify={notify} />}
            {view === 'customers' && <MembersView notify={notify} />}
            {view === 'coupons' && <CouponsView notify={notify} />}
            {view === 'bundles' && <BundlesView notify={notify} />}
            {view === 'landing' && <LandingCmsView notify={notify} />}
            {view === 'testimonials' && <TestimonialsView notify={notify} />}
            {view === 'announcements' && <AnnouncementsView notify={notify} />}
            {view === 'faqs' && <FaqsView notify={notify} />}
            {view === 'rbac' && <RbacView notify={notify} />}
            {view === 'audit' && <AuditView />}
            {view === 'seo' && <SeoView notify={notify} />}
            {view === 'settings' && <SettingsView notify={notify} />}
          </main>
        </div>
      </div>

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 95, background: '#1A2430', border: '1px solid rgba(255,255,255,.14)', borderRadius: 13, padding: '13px 20px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 16px 40px -10px rgba(0,0,0,.7)' }}>
          <span style={{ fontSize: 17 }}>{toastIcon}</span><span style={{ fontSize: 13.5, fontWeight: 600 }}>{toast}</span>
        </div>
      )}
      <style>{`
        .menu-btn{display:none}.arow:hover{background:rgba(255,255,255,.03)}
        @media(max-width:880px){
          .dash-sidebar{position:fixed!important;top:0;z-index:70;transform:translateX(-100%);transition:transform .28s}
          .dash-sidebar.open{transform:translateX(0)!important}.menu-btn{display:flex!important}
          .kpi4{grid-template-columns:repeat(2,1fr)!important}.col2{grid-template-columns:1fr!important}.ed-grid{grid-template-columns:1fr!important}
        }
        @media(min-width:881px){.sb-backdrop{display:none!important}}
        @media(max-width:560px){.kpi4{grid-template-columns:1fr!important}.signup-label,.admin-name{display:none}}
      `}</style>
    </>
  );
}

/* ── Dashboard ─────────────────────────────────────────────────────────── */
function DashboardView() {
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['admin', 'dashboard'], queryFn: adminApi.dashboard });
  if (isLoading) return <Loading variant="dashboard" />;
  if (isError || !data) return <ErrorState message="Could not load the dashboard." onRetry={() => refetch()} />;
  const d: any = data;
  const kpis = [
    { label: 'Revenue (total)', icon: '💰', bg: 'rgba(244,197,66,.15)', value: lakh(d.kpis.revenue), delta: '▲ 23.4%' },
    { label: 'Orders', icon: '🧾', bg: 'rgba(42,150,166,.15)', value: d.kpis.orders.toLocaleString('en-IN'), delta: '▲ 12.1%' },
    { label: 'New members', icon: '👑', bg: 'rgba(124,77,255,.15)', value: d.kpis.newMembers.toLocaleString('en-IN'), delta: '▲ 8.7%' },
    { label: 'Refund rate', icon: '↩', bg: 'rgba(255,82,82,.15)', value: `${d.kpis.refundRate}%`, delta: '▼ 0.3%' },
  ];
  const maxRev = Math.max(1, ...d.topProducts.map((t: any) => t.revenue));
  return (
    <div>
      <div className="kpi4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 18 }}>
        {kpis.map((k) => (
          <div key={k.label} style={{ padding: 18, borderRadius: 15, ...card }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: '#A8B3C2', fontWeight: 600 }}>{k.label}</span>
              <span style={{ width: 30, height: 30, borderRadius: 9, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{k.icon}</span>
            </div>
            <div style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 25, letterSpacing: '-.02em' }}>{k.value}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5 }}><span style={{ fontSize: 11.5, fontWeight: 700, color: '#00C853' }}>{k.delta}</span><span style={{ fontSize: 11, color: '#6b7686' }}>vs last month</span></div>
          </div>
        ))}
      </div>
      <div className="col2" style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={{ padding: 20, borderRadius: 16, ...card }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div><div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 15 }}>Revenue</div><div style={{ fontSize: 12, color: '#6b7686' }}>Last 12 weeks</div></div>
            <div style={{ textAlign: 'right' }}><div style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 22, color: '#F4C542' }}>{lakh(d.kpis.revenue)}</div><div style={{ fontSize: 11.5, color: '#00C853', fontWeight: 700 }}>▲ 23.4%</div></div>
          </div>
          <svg viewBox="0 0 620 200" style={{ width: '100%', height: 190, display: 'block' }}>
            <defs><linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2A96A6" stopOpacity="0.42" /><stop offset="1" stopColor="#2A96A6" stopOpacity="0" /></linearGradient></defs>
            <path d="M0,150 L52,140 L104,148 L156,118 L208,128 L260,92 L312,104 L364,70 L416,80 L468,52 L520,60 L572,32 L620,40 L620,200 L0,200 Z" fill="url(#rev)" />
            <path d="M0,150 L52,140 L104,148 L156,118 L208,128 L260,92 L312,104 L364,70 L416,80 L468,52 L520,60 L572,32 L620,40" fill="none" stroke="#2A96A6" strokeWidth="2.5" strokeLinejoin="round" />
            <circle cx="572" cy="32" r="4.5" fill="#F4C542" />
          </svg>
        </div>
        <div style={{ padding: 20, borderRadius: 16, ...card, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Conversion</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ width: 108, height: 108, borderRadius: '50%', background: 'conic-gradient(#2A96A6 0% 4.8%,rgba(255,255,255,.08) 4.8% 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <div style={{ width: 78, height: 78, borderRadius: '50%', background: '#0d131a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 20 }}>4.8%</span><span style={{ fontSize: 10, color: '#6b7686' }}>visit→buy</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              <div><div style={{ fontSize: 11.5, color: '#A8B3C2' }}>Orders</div><div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 16 }}>{d.kpis.orders.toLocaleString('en-IN')}</div></div>
              <div><div style={{ fontSize: 11.5, color: '#A8B3C2' }}>Members</div><div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 16 }}>{d.kpis.newMembers}</div></div>
              <div><div style={{ fontSize: 11.5, color: '#A8B3C2' }}>Refund rate</div><div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 16 }}>{d.kpis.refundRate}%</div></div>
            </div>
          </div>
        </div>
      </div>
      <div className="col2" style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 16 }}>
        <div style={{ padding: 20, borderRadius: 16, ...card }}>
          <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Top products</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {d.topProducts.map((t: any) => (
              <div key={t.name}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}><span style={{ fontSize: 13, fontWeight: 600 }}>{t.icon} {t.name}</span><span style={{ fontSize: 12.5, fontWeight: 700, color: '#F4C542' }}>{lakh(t.revenue)}</span></div>
                <div style={{ height: 7, borderRadius: 99, background: 'rgba(255,255,255,.07)', overflow: 'hidden' }}><div style={{ width: `${Math.round((t.revenue / maxRev) * 100)}%`, height: '100%', background: 'linear-gradient(90deg,#2A96A6,#F4C542)', borderRadius: 99 }} /></div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: 20, borderRadius: 16, ...card }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}><div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 15 }}>Recent orders</div></div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {d.recentOrders.map((o: any, i: number) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 12, alignItems: 'center', padding: '9px 0', borderTop: '1px solid rgba(255,255,255,.06)' }}>
                <div style={{ minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.customer}</div><div style={{ fontSize: 11.5, color: '#6b7686' }}>{o.product}</div></div>
                <span style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 13.5 }}>{rupee(o.amount)}</span>
                <Pill status={o.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Products list ─────────────────────────────────────────────────────── */
function ProductsView({ openEditor, notify }: { openEditor: (id: string | null) => void; notify: Notify }) {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['admin', 'products', search], queryFn: () => adminApi.listProducts({ search, pageSize: 50 }) });

  // Local copy so drag-reorder feels instant; re-synced whenever the query data changes.
  const [items, setItems] = useState<any[]>([]);
  const dragFrom = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  useEffect(() => { setItems(data?.data ?? []); }, [data]);
  const reorder = useMutation({
    mutationFn: (ids: string[]) => adminApi.reorderProducts(ids),
    onSuccess: () => { notify('Order saved', '✓'); qc.invalidateQueries({ queryKey: ['admin', 'products'] }); },
    onError: () => notify('Could not save order', '⚠️'),
  });
  const dropAt = (to: number) => {
    const from = dragFrom.current; dragFrom.current = null; setDragOver(null);
    if (from === null || from === to) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setItems(next);
    reorder.mutate(next.map((p) => p.id));
  };

  const bulk = useMutation({
    mutationFn: ({ action, ids }: { action: string; ids: string[] }) => adminApi.bulkProducts(action, ids),
    onSuccess: (_r, v) => { notify(`${prettyStatus(v.action)} ${v.ids.length} product(s)`, '✓'); setSelected(new Set()); qc.invalidateQueries({ queryKey: ['admin', 'products'] }); },
    onError: () => notify('Action failed', '⚠️'),
  });
  const del = useMutation({
    mutationFn: (id: string) => adminApi.deleteProduct(id),
    onSuccess: () => { notify('Product deleted', '🗑'); qc.invalidateQueries({ queryKey: ['admin', 'products'] }); },
    onError: () => notify('Delete failed', '⚠️'),
  });

  if (isLoading) return <Loading variant="table" />;
  if (isError || !data) return <ErrorState message="Could not load products." onRetry={() => refetch()} />;
  const toggle = (id: string) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const bulkActions: [string, string, string][] = [['publish', 'Publish', '#00C853'], ['archive', 'Archive', '#A8B3C2'], ['draft', 'Draft', '#36b6c9'], ['delete', 'Delete', '#ff7b7b']];
  const canDrag = !search.trim();
  const cols = '34px 30px 2.3fr 1fr 1.3fr 1fr 80px';

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 13px', borderRadius: 11, ...card, minWidth: 240 }}><span style={{ color: '#6b7686' }}>🔍</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…" style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: 13 }} /></div>
        <button onClick={() => openEditor(null)} style={primaryBtn}>+ New product</button>
      </div>

      <div style={{ fontSize: 12.5, color: '#6b7686', marginBottom: 12 }}>{canDrag ? 'Drag the ⠿ handle to reorder how products appear across the site (1, 2, 3…).' : 'Clear the search to drag and reorder products.'}</div>

      {selected.size > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '11px 16px', borderRadius: 12, background: 'rgba(42,150,166,.12)', border: '1px solid rgba(42,150,166,.3)', marginBottom: 14 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{selected.size} selected</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {bulkActions.map(([action, label, color]) => (
              <button key={action} onClick={() => bulk.mutate({ action, ids: [...selected] })} style={{ cursor: 'pointer', fontSize: 12, fontWeight: 600, color, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.14)', borderRadius: 9, padding: '8px 13px' }}>{label}</button>
            ))}
          </div>
        </div>
      )}

      <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,.08)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: cols, gap: 12, padding: '12px 16px', background: 'rgba(255,255,255,.04)', fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: '#6b7686', alignItems: 'center' }}>
          <span>#</span><span /><span>Product</span><span>Category</span><span>Price (offer/member)</span><span>Status</span><span>Actions</span>
        </div>
        {items.length === 0 ? <EmptyState title="No products found" hint="Try a different search or add a new product." /> : items.map((p, i) => {
          const on = selected.has(p.id);
          return (
            <div
              key={p.id}
              className="arow"
              draggable={canDrag}
              onDragStart={() => { if (canDrag) dragFrom.current = i; }}
              onDragOver={(e) => { if (canDrag && dragFrom.current !== null) { e.preventDefault(); setDragOver(i); } }}
              onDragLeave={() => setDragOver((o) => (o === i ? null : o))}
              onDrop={() => dropAt(i)}
              onDragEnd={() => { dragFrom.current = null; setDragOver(null); }}
              style={{ display: 'grid', gridTemplateColumns: cols, gap: 12, padding: '13px 16px', borderTop: dragOver === i ? '2px solid #2A96A6' : '1px solid rgba(255,255,255,.06)', alignItems: 'center', transition: 'background .15s', background: dragOver === i ? 'rgba(42,150,166,.08)' : 'transparent' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#6b7686' }}>
                <span title={canDrag ? 'Drag to reorder' : 'Clear search to reorder'} style={{ cursor: canDrag ? 'grab' : 'not-allowed', fontSize: 15, opacity: canDrag ? 1 : 0.4 }}>⠿</span>
                <span style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 12 }}>{i + 1}</span>
              </div>
              <button onClick={() => toggle(p.id)} style={{ cursor: 'pointer', width: 19, height: 19, borderRadius: 6, border: `1.5px solid ${on ? '#2A96A6' : 'rgba(255,255,255,.25)'}`, background: on ? '#2A96A6' : 'transparent', color: '#06222a', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{on ? '✓' : ''}</button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
                <div style={{ width: 38, height: 38, borderRadius: 9, background: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{p.icon}</div>
                <div style={{ minWidth: 0 }}><div style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div><div style={{ fontSize: 11, color: '#6b7686' }}>{p.fileCount.toLocaleString('en-IN')} files · {p.version}</div></div>
              </div>
              <span style={{ fontSize: 12.5, color: '#A8B3C2' }}>{p.category}</span>
              <div style={{ fontSize: 13 }}><span style={{ fontFamily: 'Sora', fontWeight: 700 }}>{rupee(p.priceOffer)}</span> <span style={{ color: '#F4C542', fontWeight: 600 }}>/ {rupee(p.priceMember)}</span></div>
              <Pill status={p.status} />
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => openEditor(p.id)} title="Edit" style={{ cursor: 'pointer', width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', color: '#fff', fontSize: 13 }}>✏</button>
                <button onClick={() => { if (window.confirm(`Delete "${p.name}"? This cannot be undone.`)) del.mutate(p.id); }} title="Delete" style={{ cursor: 'pointer', width: 32, height: 32, borderRadius: 8, background: 'rgba(255,82,82,.1)', border: '1px solid rgba(255,82,82,.3)', color: '#ff7b7b', fontSize: 13 }}>🗑</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Product editor ────────────────────────────────────────────────────── */
const editorSections: [string, string, string][] = [['basics', '📝', 'Basics'], ['media', '🖼', 'Media'], ['pricing', '💰', 'Pricing'], ['content', '📋', 'Content'], ['seo', '🔍', 'SEO'], ['status', '🚦', 'Status']];
const sectionFields: Record<string, [string, string, 1 | 2, boolean][]> = {
  basics: [['name', 'Product name', 2, false], ['slug', 'Slug', 2, false], ['category', 'Category', 1, false], ['version', 'Version', 1, false]],
  media: [['thumbnailUrl', 'Thumbnail URL', 2, false], ['heroUrl', 'Hero banner URL', 2, false], ['previewVideoUrl', 'Preview video URL', 2, false]],
  pricing: [['priceOriginal', 'Original price', 1, false], ['priceOffer', 'Offer price', 1, false], ['priceMember', 'Member price', 1, false], ['savingsBadge', 'Savings badge', 1, false]],
  content: [['shortDesc', 'Short description', 2, true], ['benefits', 'Benefits', 2, true], ['included', "What's included", 2, true]],
  seo: [['seoTitle', 'SEO title', 2, false], ['metaDescription', 'Meta description', 2, true], ['keywords', 'Keywords', 2, false]],
  status: [['status', 'Status', 1, false], ['version', 'Version', 1, false], ['sizeLabel', 'Size label', 2, false]],
};
const sectionTitle: Record<string, string> = { basics: 'Basics', media: 'Media & previews', pricing: 'Pricing', content: 'Content', seo: 'SEO metadata', status: 'Status & version' };
const numericKeys = ['priceOriginal', 'priceOffer', 'priceMember', 'fileCount'];

function EditorView({ id, go, notify }: { id: string | null; go: (v: string) => void; notify: Notify }) {
  const qc = useQueryClient();
  const [section, setSection] = useState('basics');
  const [form, setForm] = useState<Record<string, any>>({ status: 'DRAFT', icon: '📦', category: 'General', version: 'v1.0' });
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'product', id], queryFn: () => adminApi.getProduct(id!), enabled: !!id });

  useMemo(() => { if (data) setForm(data as any); }, [data]);

  const save = useMutation({
    mutationFn: (status?: string) => {
      const payload: Record<string, any> = { ...form };
      if (status) payload.status = status;
      numericKeys.forEach((k) => { if (payload[k] != null) payload[k] = Number(payload[k]) || 0; });
      return id ? adminApi.updateProduct(id, payload) : adminApi.createProduct(payload);
    },
    onSuccess: (_r, status) => { notify(status === 'PUBLISHED' ? 'Product published' : 'Saved as draft', status === 'PUBLISHED' ? '✅' : '💾'); qc.invalidateQueries({ queryKey: ['admin', 'products'] }); go('products'); },
    onError: (e: any) => notify(e?.response?.data?.error?.message ?? 'Save failed', '⚠️'),
  });

  if (id && isLoading) return <Loading />;
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div>
      <button onClick={() => go('products')} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7, background: 'none', border: 'none', color: '#A8B3C2', fontSize: 13, fontWeight: 600, marginBottom: 16 }}>← Back to products</button>
      <div className="ed-grid" style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignSelf: 'start', position: 'sticky', top: 78 }}>
          {editorSections.map(([k, icon, label]) => (
            <button key={k} onClick={() => setSection(k)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9, padding: '10px 12px', borderRadius: 9, border: 'none', background: section === k ? 'rgba(42,150,166,.16)' : 'transparent', color: section === k ? '#fff' : '#A8B3C2', fontFamily: '"Plus Jakarta Sans"', fontWeight: 600, fontSize: 13, textAlign: 'left' }}>{icon} {label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 80 }}>
          <div style={{ padding: 22, borderRadius: 16, ...card }}>
            <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 16, marginBottom: 18 }}>{sectionTitle[section]}</div>
            <div className="ed-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {sectionFields[section].map(([key, label, span, area]) => (
                <div key={key} style={{ gridColumn: span === 2 ? 'span 2' : 'span 1' }}>
                  <label style={lbl}>{label}</label>
                  {area
                    ? <textarea rows={3} value={form[key] ?? ''} onChange={(e) => set(key, e.target.value)} style={{ ...inp, resize: 'none' }} />
                    : <input value={form[key] ?? ''} onChange={(e) => set(key, e.target.value)} placeholder={label} style={inp} />}
                </div>
              ))}
            </div>
          </div>
          <div style={{ padding: 22, borderRadius: 16, ...card }}>
            <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 15, marginBottom: 6 }}>External links & access</div>
            <div style={{ fontSize: 12.5, color: '#6b7686', marginBottom: 16 }}>Buyers are redirected to the payment link to buy, then redeem the purchase code in their dashboard to unlock the download folder.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div><label style={lbl}>📁 Download folder link</label><input value={form.downloadLink ?? ''} onChange={(e) => set('downloadLink', e.target.value)} placeholder="https://drive.google.com/drive/folders/…" style={inp} /></div>
              <div><label style={lbl}>💳 Payment / checkout link</label><input value={form.paymentLink ?? ''} onChange={(e) => set('paymentLink', e.target.value)} placeholder="https://rzp.io/l/…" style={inp} /></div>
              <div><label style={lbl}>🔑 Purchase code <span style={{ color: '#6b7686', fontWeight: 400 }}>— members enter this to unlock the product</span></label><input value={form.purchaseCode ?? ''} onChange={(e) => set('purchaseCode', e.target.value)} placeholder="e.g. GWL-VIDEOS24" style={{ ...inp, fontFamily: 'Sora', letterSpacing: '.04em' }} /></div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ position: 'sticky', bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 18px', borderRadius: 14, background: 'rgba(13,19,26,.95)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,.12)', boxShadow: '0 -10px 30px -10px rgba(0,0,0,.6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F4C542' }} /><span style={{ fontSize: 13, color: '#A8B3C2' }}>{id ? 'Editing' : 'New product'} · Status: <b style={{ color: '#fff' }}>{prettyStatus(form.status ?? 'DRAFT')}</b></span></div>
        <div style={{ display: 'flex', gap: 9 }}>
          <button disabled={save.isPending} onClick={() => save.mutate('DRAFT')} style={{ cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#fff', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.14)', borderRadius: 10, padding: '10px 16px' }}>Save draft</button>
          <button disabled={save.isPending} onClick={() => save.mutate('PUBLISHED')} style={{ cursor: 'pointer', fontFamily: 'Sora', fontWeight: 700, fontSize: 13, color: '#06222a', background: 'linear-gradient(95deg,#00C853,#0a9c45)', border: 'none', borderRadius: 10, padding: '10px 18px' }}>Publish</button>
        </div>
      </div>
    </div>
  );
}

/* ── Members ───────────────────────────────────────────────────────────── */
const memberStatusMeta: Record<string, { label: string; color: string; bg: string }> = {
  ACTIVE: { label: 'Active', color: '#00C853', bg: 'rgba(0,200,83,.12)' },
  SUSPENDED: { label: 'Inactive', color: '#F4C542', bg: 'rgba(244,197,66,.12)' },
  INVITED: { label: 'Invited', color: '#36b6c9', bg: 'rgba(54,182,201,.12)' },
  BLOCKED: { label: 'Blocked', color: '#ff5252', bg: 'rgba(255,82,82,.14)' },
};

function MembersView({ notify }: { notify: Notify }) {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<any | null>(null);
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['admin', 'customers', search], queryFn: () => adminApi.listCustomers({ search, pageSize: 50 }) });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin', 'customers'] });
  const status = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => adminApi.setMemberStatus(id, status),
    onSuccess: (_r, v) => { notify(v.status === 'ACTIVE' ? 'Login activated' : v.status === 'SUSPENDED' ? 'Login deactivated' : 'Member blocked', v.status === 'BLOCKED' ? '🚫' : '✓'); invalidate(); },
    onError: (e: any) => notify(e?.response?.data?.error?.message ?? 'Action failed', '⚠️'),
  });
  const save = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, any> }) => adminApi.updateMember(id, body),
    onSuccess: () => { notify('Member updated', '✅'); setEditing(null); invalidate(); },
    onError: (e: any) => notify(e?.response?.data?.error?.message ?? 'Save failed', '⚠️'),
  });
  const del = useMutation({
    mutationFn: (id: string) => adminApi.deleteMember(id),
    onSuccess: () => { notify('Member deleted', '🗑'); invalidate(); },
    onError: (e: any) => notify(e?.response?.data?.error?.message ?? 'Delete failed', '⚠️'),
  });

  if (isLoading) return <Loading variant="table" />;
  if (isError || !data) return <ErrorState message="Could not load members." onRetry={() => refetch()} />;
  const colors = ['#2A96A6', '#D4A017', '#7c4dff', '#00C853', '#ff5252', '#36b6c9'];
  const blocked = data.data.filter((m: any) => m.status === 'BLOCKED').length;

  const actBtn = (label: string, color: string, onClick: () => void) => (
    <button onClick={onClick} disabled={status.isPending} style={{ cursor: 'pointer', fontSize: 11.5, fontWeight: 700, color, background: 'rgba(255,255,255,.05)', border: `1px solid ${color}40`, borderRadius: 8, padding: '6px 10px', whiteSpace: 'nowrap' }}>{label}</button>
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: '#A8B3C2' }}>{(data.meta as any)?.total ?? data.data.length} members · {(data.meta as any)?.memberCount ?? 0} lifetime · {blocked} blocked</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 13px', borderRadius: 11, ...card, minWidth: 240 }}><span style={{ color: '#6b7686' }}>🔍</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search members…" style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: 13 }} /></div>
      </div>
      <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,.08)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr .6fr .8fr .9fr .9fr 2.2fr', gap: 12, padding: '12px 16px', background: 'rgba(255,255,255,.04)', fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: '#6b7686' }}>
          <span>Member</span><span>Orders</span><span>Spent</span><span>Type</span><span>Status</span><span>Manage</span>
        </div>
        {data.data.length === 0 ? <EmptyState title="No members found" hint="Members appear here once people create a login." /> : data.data.map((c: any, i: number) => {
          const meta = memberStatusMeta[c.status] ?? memberStatusMeta.ACTIVE;
          return (
            <div key={c.id} className="arow" style={{ display: 'grid', gridTemplateColumns: '1.8fr .6fr .8fr .9fr .9fr 2.2fr', gap: 12, padding: '13px 16px', borderTop: '1px solid rgba(255,255,255,.06)', alignItems: 'center', fontSize: 13 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: colors[i % colors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Sora', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{c.initial}</div>
                <div style={{ minWidth: 0 }}><div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div><div style={{ fontSize: 11, color: '#6b7686', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.email}</div></div>
              </div>
              <span>{c.orders}</span>
              <span style={{ fontFamily: 'Sora', fontWeight: 700 }}>{rupee(c.spent)}</span>
              <span><span style={{ fontSize: 11, fontWeight: 700, color: c.type === 'Member' ? '#F4C542' : '#A8B3C2', background: c.type === 'Member' ? 'rgba(244,197,66,.12)' : 'rgba(255,255,255,.07)', padding: '3px 10px', borderRadius: 999 }}>{c.type}</span></span>
              <span><span style={{ fontSize: 11, fontWeight: 700, color: meta.color, background: meta.bg, padding: '3px 10px', borderRadius: 999, whiteSpace: 'nowrap' }}>● {meta.label}</span></span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <button onClick={() => setEditing(c)} style={{ cursor: 'pointer', fontSize: 11.5, fontWeight: 700, color: '#fff', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.14)', borderRadius: 8, padding: '6px 10px' }}>Edit</button>
                {c.status !== 'ACTIVE' && actBtn('Activate', '#00C853', () => status.mutate({ id: c.id, status: 'ACTIVE' }))}
                {c.status === 'ACTIVE' && actBtn('Deactivate', '#F4C542', () => status.mutate({ id: c.id, status: 'SUSPENDED' }))}
                {c.status !== 'BLOCKED' && actBtn('Block', '#ff5252', () => { if (window.confirm(`Permanently block ${c.name}? They will no longer be able to sign in.`)) status.mutate({ id: c.id, status: 'BLOCKED' }); })}
                {actBtn('Delete', '#ff5252', () => { if (window.confirm(`Permanently delete ${c.name} (${c.email})? This removes their account, downloads and wishlist — it cannot be undone.`)) del.mutate(c.id); })}
              </div>
            </div>
          );
        })}
      </div>
      {editing && <MemberEditModal member={editing} onClose={() => setEditing(null)} onSave={(body) => save.mutate({ id: editing.id, body })} saving={save.isPending} />}
    </div>
  );
}

function MemberEditModal({ member, onClose, onSave, saving }: { member: any; onClose: () => void; onSave: (b: Record<string, any>) => void; saving: boolean }) {
  const [form, setForm] = useState({ name: member.name ?? '', email: member.email ?? '', phone: member.phone ?? '', country: member.country ?? '', membership: member.membership ?? 'NONE' });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 'min(480px,100%)', background: '#0d131a', border: '1px solid rgba(255,255,255,.12)', borderRadius: 18, padding: 24, boxShadow: '0 30px 80px -20px rgba(0,0,0,.8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 18 }}>Edit member</div>
          <button onClick={onClose} style={{ cursor: 'pointer', width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', color: '#fff', fontSize: 15 }}>✕</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div style={{ gridColumn: 'span 2' }}><label style={lbl}>Full name</label><input value={form.name} onChange={(e) => set('name', e.target.value)} style={inp} /></div>
          <div style={{ gridColumn: 'span 2' }}><label style={lbl}>Email</label><input value={form.email} onChange={(e) => set('email', e.target.value)} style={inp} /></div>
          <div><label style={lbl}>Phone</label><input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+91…" style={inp} /></div>
          <div><label style={lbl}>Country</label><input value={form.country} onChange={(e) => set('country', e.target.value)} style={inp} /></div>
          <div style={{ gridColumn: 'span 2' }}><label style={lbl}>Membership</label>
            <select value={form.membership} onChange={(e) => set('membership', e.target.value)} style={inp}>
              <option value="NONE">None (Guest)</option><option value="LIFETIME">Lifetime Member</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
          <button onClick={onClose} style={{ cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#fff', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.14)', borderRadius: 10, padding: '10px 16px' }}>Cancel</button>
          <button disabled={saving} onClick={() => onSave(form)} style={{ ...primaryBtn, opacity: saving ? .6 : 1 }}>{saving ? 'Saving…' : 'Save changes'}</button>
        </div>
      </div>
    </div>
  );
}

/* ── Coupons ───────────────────────────────────────────────────────────── */
function CouponsView({ notify }: { notify: Notify }) {
  const qc = useQueryClient();
  const [modal, setModal] = useState<null | 'new' | any>(null);
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['admin', 'coupons'], queryFn: adminApi.coupons });
  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin', 'coupons'] });
  const toggle = useMutation({ mutationFn: adminApi.toggleCoupon, onSuccess: invalidate });
  const save = useMutation({
    mutationFn: (b: any) => { b.code = String(b.code || '').toUpperCase(); return modal === 'new' ? adminApi.createCoupon(b) : adminApi.updateCoupon((modal as any).id, b); },
    onSuccess: () => { notify(modal === 'new' ? 'Coupon created' : 'Coupon updated', '🏷'); setModal(null); invalidate(); },
    onError: (e: any) => notify(e?.response?.data?.error?.message ?? 'Save failed', '⚠️'),
  });
  const del = useMutation({ mutationFn: (id: string) => adminApi.deleteCoupon(id), onSuccess: () => { notify('Coupon deleted', '🗑'); invalidate(); }, onError: () => notify('Delete failed', '⚠️') });
  if (isLoading) return <Loading />;
  if (isError || !data) return <ErrorState message="Could not load coupons." onRetry={() => refetch()} />;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}><button onClick={() => setModal('new')} style={primaryBtn}>+ New coupon</button></div>
      <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,.08)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1.4fr .9fr 1fr 70px 84px', gap: 12, padding: '12px 16px', background: 'rgba(255,255,255,.04)', fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: '#6b7686' }}>
          <span>Code</span><span>Discount</span><span>Scope</span><span>Usage</span><span>Expiry</span><span>Active</span><span>Edit</span>
        </div>
        {(data as any[]).map((c) => (
          <div key={c.id} className="arow" style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1.4fr .9fr 1fr 70px 84px', gap: 12, padding: '13px 16px', borderTop: '1px solid rgba(255,255,255,.06)', alignItems: 'center', fontSize: 13 }}>
            <span style={{ fontFamily: 'Sora', fontWeight: 700, letterSpacing: '.03em' }}>{c.code}</span>
            <span style={{ color: '#F4C542', fontWeight: 700 }}>{couponDiscount(c.type, c.value)}</span>
            <span style={{ color: '#A8B3C2' }}>{c.scopeLabel}</span>
            <span>{c.usageCount.toLocaleString('en-IN')} used</span>
            <span style={{ color: '#6b7686', fontSize: 12 }}>{couponExpiry(c.expiresAt)}</span>
            <Toggle on={c.active} onClick={() => toggle.mutate(c.id)} />
            <RowActions onEdit={() => setModal(c)} onDelete={() => { if (window.confirm(`Delete coupon ${c.code}?`)) del.mutate(c.id); }} />
          </div>
        ))}
      </div>
      {modal && (
        <CrudModal
          title={modal === 'new' ? 'New coupon' : `Edit ${(modal as any).code}`}
          fields={COUPON_FIELDS}
          initial={modal === 'new' ? { code: '', type: 'PERCENT', value: 10, scope: 'ALL_PRODUCTS', scopeLabel: 'All products', expiresAt: null, autoApply: false, active: true } : modal}
          onClose={() => setModal(null)} onSubmit={(b) => save.mutate(b)} submitting={save.isPending}
        />
      )}
    </div>
  );
}

/* ── Bundles ───────────────────────────────────────────────────────────── */
const BUNDLE_BASE_FIELDS: CrudField[] = [
  { key: 'name', label: 'Bundle name', span: 2 },
  { key: 'icon', label: 'Icon (emoji)', placeholder: '🎁' },
  { key: 'description', label: 'Description', type: 'textarea', span: 2 },
  { key: 'priceOriginal', label: 'Original price (₹)', type: 'number' },
  { key: 'price', label: 'Bundle price (₹)', type: 'number' },
  { key: 'active', label: 'Active', type: 'toggle' },
];

function BundlesView({ notify }: { notify: Notify }) {
  const qc = useQueryClient();
  const [modal, setModal] = useState<null | 'new' | any>(null);
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['admin', 'bundles'], queryFn: adminApi.bundles });
  const { data: productData } = useQuery({ queryKey: ['admin', 'products', 'all'], queryFn: () => adminApi.listProducts({ pageSize: 100 }) });
  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin', 'bundles'] });
  const toggle = useMutation({ mutationFn: adminApi.toggleBundle, onSuccess: invalidate });
  const save = useMutation({
    mutationFn: (b: any) => { b.status = b.active ? 'ACTIVE' : 'PAUSED'; return modal === 'new' ? adminApi.createBundle(b) : adminApi.updateBundle((modal as any).id, b); },
    onSuccess: () => { notify(modal === 'new' ? 'Bundle created' : 'Bundle updated', '🎁'); setModal(null); invalidate(); },
    onError: (e: any) => notify(e?.response?.data?.error?.message ?? 'Save failed', '⚠️'),
  });
  const del = useMutation({ mutationFn: (id: string) => adminApi.deleteBundle(id), onSuccess: () => { notify('Bundle deleted', '🗑'); invalidate(); }, onError: () => notify('Delete failed', '⚠️') });
  if (isLoading) return <Loading />;
  if (isError || !data) return <ErrorState message="Could not load bundles." onRetry={() => refetch()} />;
  const productOptions = (productData?.data ?? []).map((p: any) => ({ value: p.id, label: `${p.icon} ${p.name}` }));
  const fields: CrudField[] = [...BUNDLE_BASE_FIELDS, { key: 'productIds', label: 'Products in bundle', type: 'multiselect', span: 2, options: productOptions }];
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}><button onClick={() => setModal('new')} style={primaryBtn}>+ New bundle</button></div>
      <div className="col2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 }}>
        {(data as any[]).map((b) => (
          <div key={b.id} style={{ padding: 20, borderRadius: 16, background: 'rgba(255,255,255,.04)', border: `1px solid ${b.active ? 'rgba(0,200,83,.2)' : 'rgba(255,255,255,.08)'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}><div style={{ width: 46, height: 46, borderRadius: 12, background: 'rgba(244,197,66,.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{b.icon}</div><div><div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 15 }}>{b.name}</div><div style={{ fontSize: 11.5, color: '#6b7686' }}>{b.items?.length ?? 0} products</div></div></div>
              <Toggle on={b.active} onClick={() => toggle.mutate(b.id)} />
            </div>
            <div style={{ fontSize: 12.5, color: '#A8B3C2', marginBottom: 14 }}>{b.description}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div><span style={{ fontSize: 13, color: '#6b7686', textDecoration: 'line-through' }}>{rupee(b.priceOriginal)}</span> <span style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 18, color: '#F4C542' }}>{rupee(b.price)}</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Pill status={b.status} /><RowActions onEdit={() => setModal({ ...b, productIds: (b.items ?? []).map((i: any) => i.productId) })} onDelete={() => { if (window.confirm(`Delete bundle ${b.name}?`)) del.mutate(b.id); }} /></div>
            </div>
          </div>
        ))}
      </div>
      {modal && (
        <CrudModal
          title={modal === 'new' ? 'New bundle' : `Edit ${(modal as any).name}`}
          fields={fields}
          initial={modal === 'new' ? { name: '', icon: '🎁', description: '', priceOriginal: 0, price: 0, active: true, productIds: [] } : modal}
          onClose={() => setModal(null)} onSubmit={(b) => save.mutate(b)} submitting={save.isPending}
        />
      )}
    </div>
  );
}

/* ── Landing CMS ───────────────────────────────────────────────────────── */
function LandingCmsView({ notify }: { notify: Notify }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'landing'], queryFn: adminApi.landing });
  const toggle = useMutation({ mutationFn: adminApi.toggleLanding, onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'landing'] }) });
  return (
    <div className="col2" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 18 }}>
      <div style={{ padding: 22, borderRadius: 16, ...card }}>
        <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Hero content</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          <div><label style={lbl}>Headline</label><input defaultValue="Create Faster. Grow Smarter." style={inp} /></div>
          <div><label style={lbl}>Description</label><textarea rows={3} defaultValue="Premium digital assets designed for creators, freelancers and businesses." style={{ ...inp, resize: 'none' }} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}><div><label style={lbl}>Primary CTA</label><input defaultValue="Explore Products" style={inp} /></div><div><label style={lbl}>Secondary CTA</label><input defaultValue="Become Member" style={inp} /></div></div>
          <button onClick={() => notify('Landing page saved', '✅')} style={{ ...primaryBtn, alignSelf: 'flex-start', borderRadius: 10, padding: '11px 20px', marginTop: 4 }}>Save changes</button>
        </div>
      </div>
      <div style={{ padding: 22, borderRadius: 16, ...card }}>
        <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Section visibility</div>
        <div style={{ fontSize: 12, color: '#6b7686', marginBottom: 16 }}>Toggle sections on the public landing page.</div>
        {isLoading ? <Loading /> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {(data as any[]).map((ls) => (
              <div key={ls.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 12px', borderRadius: 10, background: 'rgba(255,255,255,.03)' }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{ls.name}</span>
                <Toggle on={ls.enabled} onClick={() => toggle.mutate(ls.id)} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Testimonials ──────────────────────────────────────────────────────── */
function TestimonialsView({ notify }: { notify: Notify }) {
  const qc = useQueryClient();
  const [modal, setModal] = useState<null | 'new' | any>(null);
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['admin', 'testimonials'], queryFn: adminApi.testimonials });
  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin', 'testimonials'] });
  const toggle = useMutation({ mutationFn: adminApi.toggleTestimonial, onSuccess: invalidate });
  const save = useMutation({
    mutationFn: (b: any) => { b.stars = Number(b.stars) || 5; return modal === 'new' ? adminApi.createTestimonial(b) : adminApi.updateTestimonial((modal as any).id, b); },
    onSuccess: () => { notify(modal === 'new' ? 'Testimonial added' : 'Testimonial updated', '⭐'); setModal(null); invalidate(); },
    onError: (e: any) => notify(e?.response?.data?.error?.message ?? 'Save failed', '⚠️'),
  });
  const del = useMutation({ mutationFn: (id: string) => adminApi.deleteTestimonial(id), onSuccess: () => { notify('Testimonial deleted', '🗑'); invalidate(); }, onError: () => notify('Delete failed', '⚠️') });
  if (isLoading) return <Loading />;
  if (isError || !data) return <ErrorState message="Could not load testimonials." onRetry={() => refetch()} />;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}><button onClick={() => setModal('new')} style={primaryBtn}>+ Add testimonial</button></div>
      <div className="col2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }}>
        {(data as any[]).map((t) => (
          <div key={t.id} style={{ padding: 18, borderRadius: 14, ...card }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ width: 38, height: 38, borderRadius: '50%', background: t.avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Sora', fontWeight: 700, fontSize: 14 }}>{t.initial}</div><div><div style={{ fontSize: 13.5, fontWeight: 600 }}>{t.name}</div><div style={{ fontSize: 11, color: '#F4C542' }}>{stars(t.stars)}</div></div></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button onClick={() => toggle.mutate(t.id)} style={{ cursor: 'pointer', fontSize: 11, fontWeight: 700, color: t.published ? '#00C853' : '#A8B3C2', background: t.published ? 'rgba(0,200,83,.1)' : 'rgba(255,255,255,.05)', border: `1px solid ${t.published ? 'rgba(0,200,83,.25)' : 'rgba(255,255,255,.12)'}`, borderRadius: 8, padding: '5px 11px' }}>{t.published ? 'Published' : 'Hidden'}</button>
                <RowActions onEdit={() => setModal(t)} onDelete={() => { if (window.confirm(`Delete testimonial from ${t.name}?`)) del.mutate(t.id); }} />
              </div>
            </div>
            <div style={{ fontSize: 13, color: '#A8B3C2', lineHeight: 1.5 }}>"{t.text}"</div>
          </div>
        ))}
      </div>
      {modal && (
        <CrudModal
          title={modal === 'new' ? 'New testimonial' : `Edit ${(modal as any).name}`}
          fields={TESTIMONIAL_FIELDS}
          initial={modal === 'new' ? { name: '', text: '', stars: '5', avatarBg: '#2A96A6', sortOrder: 0, published: true } : { ...modal, stars: String(modal.stars) }}
          onClose={() => setModal(null)} onSubmit={(b) => save.mutate(b)} submitting={save.isPending}
        />
      )}
    </div>
  );
}

/* ── Announcements ─────────────────────────────────────────────────────── */
function AnnouncementsView({ notify }: { notify: Notify }) {
  const qc = useQueryClient();
  const [modal, setModal] = useState<null | 'new' | any>(null);
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['admin', 'announcements'], queryFn: adminApi.announcements });
  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin', 'announcements'] });
  const toggle = useMutation({ mutationFn: adminApi.toggleAnnouncement, onSuccess: invalidate });
  const save = useMutation({
    mutationFn: (b: any) => modal === 'new' ? adminApi.createAnnouncement(b) : adminApi.updateAnnouncement((modal as any).id, b),
    onSuccess: () => { notify(modal === 'new' ? 'Announcement created' : 'Announcement updated', '📢'); setModal(null); invalidate(); },
    onError: (e: any) => notify(e?.response?.data?.error?.message ?? 'Save failed', '⚠️'),
  });
  const del = useMutation({ mutationFn: (id: string) => adminApi.deleteAnnouncement(id), onSuccess: () => { notify('Announcement deleted', '🗑'); invalidate(); }, onError: () => notify('Delete failed', '⚠️') });
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}><button onClick={() => setModal('new')} style={primaryBtn}>+ New announcement</button></div>
      {isLoading ? <Loading /> : isError || !data ? <ErrorState message="Could not load announcements." onRetry={() => refetch()} /> : (
        <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,.08)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2.4fr 1fr 1.2fr 70px 84px', gap: 12, padding: '12px 16px', background: 'rgba(255,255,255,.04)', fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: '#6b7686' }}><span>Announcement</span><span>Type</span><span>Schedule</span><span>Live</span><span>Edit</span></div>
          {(data as any[]).map((a) => (
            <div key={a.id} className="arow" style={{ display: 'grid', gridTemplateColumns: '2.4fr 1fr 1.2fr 70px 84px', gap: 12, padding: '13px 16px', borderTop: '1px solid rgba(255,255,255,.06)', alignItems: 'center', fontSize: 13 }}>
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.message}</span>
              <span><span style={{ fontSize: 11, fontWeight: 600, color: '#36b6c9', background: 'rgba(42,150,166,.12)', padding: '3px 9px', borderRadius: 999 }}>{prettyStatus(a.type)}</span></span>
              <span style={{ color: '#6b7686', fontSize: 12 }}>{a.schedule}</span>
              <Toggle on={a.active} onClick={() => toggle.mutate(a.id)} />
              <RowActions onEdit={() => setModal(a)} onDelete={() => { if (window.confirm('Delete this announcement?')) del.mutate(a.id); }} />
            </div>
          ))}
        </div>
      )}
      {modal && (
        <CrudModal
          title={modal === 'new' ? 'New announcement' : 'Edit announcement'}
          fields={ANNOUNCEMENT_FIELDS}
          initial={modal === 'new' ? { message: '', type: 'UPDATE', schedule: 'Now', active: true, sortOrder: 0 } : modal}
          onClose={() => setModal(null)} onSubmit={(b) => save.mutate(b)} submitting={save.isPending}
        />
      )}
    </div>
  );
}

/* ── FAQs ──────────────────────────────────────────────────────────────── */
function FaqsView({ notify }: { notify: Notify }) {
  const qc = useQueryClient();
  const [modal, setModal] = useState<null | 'new' | any>(null);
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['admin', 'faqs'], queryFn: adminApi.faqs });
  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin', 'faqs'] });
  const toggle = useMutation({ mutationFn: adminApi.toggleFaq, onSuccess: invalidate });
  const save = useMutation({
    mutationFn: (b: any) => modal === 'new' ? adminApi.createFaq(b) : adminApi.updateFaq((modal as any).id, b),
    onSuccess: () => { notify(modal === 'new' ? 'FAQ created' : 'FAQ updated', '❓'); setModal(null); invalidate(); },
    onError: (e: any) => notify(e?.response?.data?.error?.message ?? 'Save failed', '⚠️'),
  });
  const del = useMutation({ mutationFn: (id: string) => adminApi.deleteFaq(id), onSuccess: () => { notify('FAQ deleted', '🗑'); invalidate(); }, onError: () => notify('Delete failed', '⚠️') });
  if (isLoading) return <Loading />;
  if (isError || !data) return <ErrorState message="Could not load FAQs." onRetry={() => refetch()} />;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}><button onClick={() => setModal('new')} style={primaryBtn}>+ New FAQ</button></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {(data as any[]).map((f) => (
          <div key={f.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, padding: '15px 18px', borderRadius: 13, ...card }}>
            <div style={{ minWidth: 0 }}><div style={{ fontSize: 14, fontWeight: 600 }}>{f.question}</div><div style={{ fontSize: 12, color: '#6b7686', marginTop: 3 }}>{f.category}</div></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={() => toggle.mutate(f.id)} style={{ cursor: 'pointer', fontSize: 11, fontWeight: 700, color: f.published ? '#00C853' : '#A8B3C2', background: f.published ? 'rgba(0,200,83,.1)' : 'rgba(255,255,255,.05)', border: `1px solid ${f.published ? 'rgba(0,200,83,.25)' : 'rgba(255,255,255,.12)'}`, borderRadius: 8, padding: '5px 11px' }}>{f.published ? 'Live' : 'Draft'}</button>
              <RowActions onEdit={() => setModal(f)} onDelete={() => { if (window.confirm('Delete this FAQ?')) del.mutate(f.id); }} />
            </div>
          </div>
        ))}
      </div>
      {modal && (
        <CrudModal
          title={modal === 'new' ? 'New FAQ' : 'Edit FAQ'}
          fields={FAQ_FIELDS}
          initial={modal === 'new' ? { question: '', answer: '', category: 'General', sortOrder: 0, published: true } : modal}
          onClose={() => setModal(null)} onSubmit={(b) => save.mutate(b)} submitting={save.isPending}
        />
      )}
    </div>
  );
}

/* ── RBAC ──────────────────────────────────────────────────────────────── */
function RbacView({ notify }: { notify: Notify }) {
  const qc = useQueryClient();
  const [newRole, setNewRole] = useState('');
  const [teamModal, setTeamModal] = useState<null | 'new' | any>(null);
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['admin', 'rbac'], queryFn: adminApi.rbac });
  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin', 'rbac'] });
  const setPerm = useMutation({ mutationFn: ({ roleId, module, allowed }: { roleId: string; module: string; allowed: boolean }) => adminApi.setPermission(roleId, module, allowed), onSuccess: invalidate, onError: () => notify('Super Admin has full access', '🛡') });
  const createRole = useMutation({ mutationFn: (name: string) => adminApi.createRole(name), onSuccess: (r: any) => { notify(`Role "${r.name}" created`, '🛡'); setNewRole(''); invalidate(); }, onError: (e: any) => notify(e?.response?.data?.error?.message ?? 'Could not create role', '⚠️') });
  const renameRole = useMutation({ mutationFn: ({ id, name }: { id: string; name: string }) => adminApi.updateRole(id, name), onSuccess: () => { notify('Role renamed', '✏'); invalidate(); }, onError: (e: any) => notify(e?.response?.data?.error?.message ?? 'Rename failed', '⚠️') });
  const deleteRole = useMutation({ mutationFn: (id: string) => adminApi.deleteRole(id), onSuccess: () => { notify('Role deleted', '🗑'); invalidate(); }, onError: (e: any) => notify(e?.response?.data?.error?.message ?? 'Delete failed', '⚠️') });
  const saveTeam = useMutation({
    mutationFn: (b: any) => teamModal === 'new' ? adminApi.createTeamMember(b) : adminApi.updateTeamMember((teamModal as any).id, b),
    onSuccess: () => { notify(teamModal === 'new' ? 'Team member added' : 'Team member updated', '👤'); setTeamModal(null); invalidate(); },
    onError: (e: any) => notify(e?.response?.data?.error?.message ?? 'Save failed', '⚠️'),
  });
  const deleteTeam = useMutation({ mutationFn: (id: string) => adminApi.deleteTeamMember(id), onSuccess: () => { notify('Team member removed', '🗑'); invalidate(); }, onError: (e: any) => notify(e?.response?.data?.error?.message ?? 'Remove failed', '⚠️') });
  if (isLoading) return <Loading />;
  if (isError || !data) return <ErrorState message="Could not load roles." onRetry={() => refetch()} />;
  const d: any = data;
  const roleOptions = d.roles.map((r: any) => ({ value: r.key, label: r.name }));
  const teamFields: CrudField[] = [
    { key: 'name', label: 'Full name', span: 2 },
    { key: 'email', label: 'Email', span: 2 },
    { key: 'password', label: teamModal === 'new' ? 'Password' : 'New password (blank = keep)', span: 2, placeholder: teamModal === 'new' ? 'Min 4 characters' : 'Leave blank to keep current' },
    { key: 'teamRole', label: 'Role', type: 'select', options: roleOptions },
    { key: 'status', label: 'Status', type: 'select', options: [{ value: 'ACTIVE', label: 'Active' }, { value: 'SUSPENDED', label: 'Suspended' }, { value: 'INVITED', label: 'Invited' }] },
  ];
  const roleColors: Record<string, string> = { SUPER_ADMIN: '#F4C542', ADMIN: '#36b6c9', MARKETING: '#36b6c9', SUPPORT: '#7c8bff', FINANCE: '#ff9b6b' };
  const teamColors = ['linear-gradient(135deg,#7c4dff,#2A96A6)', '#2A96A6', '#D4A017', '#00C853'];
  return (
    <div>
      <div style={{ padding: '18px 20px', borderRadius: 14, ...card, marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
          <div><div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 15 }}>Roles</div><div style={{ fontSize: 12, color: '#6b7686', marginTop: 2 }}>Create access profiles for your team. New roles start with no access — grant modules below.</div></div>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); if (newRole.trim().length >= 2) createRole.mutate(newRole.trim()); }} style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <input value={newRole} onChange={(e) => setNewRole(e.target.value)} placeholder="New role name (e.g. Content Manager)" style={{ ...inp, flex: 1, minWidth: 220 }} />
          <button type="submit" disabled={createRole.isPending || newRole.trim().length < 2} style={{ ...primaryBtn, opacity: newRole.trim().length < 2 ? .5 : 1 }}>+ Create role</button>
        </form>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {d.roles.map((r: any) => (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px 7px 13px', borderRadius: 999, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: roleColors[r.key] ?? '#dfe5ee' }}>{r.name}</span>
              {r.locked ? (
                <span title="Locked — full access" style={{ fontSize: 11, color: '#6b7686' }}>🔒</span>
              ) : (
                <>
                  <button title="Rename" onClick={() => { const n = window.prompt('Rename role', r.name); if (n && n.trim().length >= 2) renameRole.mutate({ id: r.id, name: n.trim() }); }} style={{ cursor: 'pointer', width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', color: '#A8B3C2', fontSize: 11 }}>✏</button>
                  <button title="Delete" onClick={() => { if (window.confirm(`Delete the "${r.name}" role?`)) deleteRole.mutate(r.id); }} style={{ cursor: 'pointer', width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,82,82,.1)', border: '1px solid rgba(255,82,82,.3)', color: '#ff7b7b', fontSize: 12 }}>✕</button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '18px 20px', borderRadius: 14, ...card, marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
          <div><div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 15 }}>Team members</div><div style={{ fontSize: 12, color: '#6b7686', marginTop: 2 }}>Staff who can sign in to this admin portal.</div></div>
          <button onClick={() => setTeamModal('new')} style={primaryBtn}>+ Add team member</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {d.team.map((u: any, i: number) => (
            <div key={u.id} className="arow" style={{ display: 'grid', gridTemplateColumns: '2fr 1.4fr 1fr 120px', gap: 12, alignItems: 'center', padding: '10px 8px', borderRadius: 9 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}><div style={{ width: 34, height: 34, borderRadius: '50%', background: teamColors[i % teamColors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Sora', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{u.initial}</div><div style={{ minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</div><div style={{ fontSize: 11, color: '#6b7686' }}>{u.email}</div></div></div>
              <span style={{ fontSize: 12, fontWeight: 700, color: roleColors[u.role] ?? '#A8B3C2' }}>{(d.roles.find((r: any) => r.key === u.role)?.name) ?? u.role}</span>
              <span style={{ fontSize: 11.5, color: u.status === 'ACTIVE' ? '#00C853' : '#F4C542' }}>● {prettyStatus(u.status)}</span>
              <RowActions onEdit={() => setTeamModal({ ...u, teamRole: u.role, password: '' })} onDelete={u.role === 'SUPER_ADMIN' ? undefined : () => { if (window.confirm(`Remove ${u.name} from the team?`)) deleteTeam.mutate(u.id); }} />
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '18px 20px', borderRadius: 14, ...card, overflowX: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}><div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 15 }}>Permission matrix</div><div style={{ fontSize: 11.5, color: '#6b7686' }}>Tap a cell to toggle access</div></div>
        <div style={{ minWidth: 560 }}>
          <div style={{ display: 'grid', gridTemplateColumns: `1.4fr repeat(${d.roles.length},1fr)`, gap: 8, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,.08)' }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', color: '#6b7686' }}>Module</span>
            {d.roles.map((r: any) => <span key={r.id} style={{ fontSize: 11, fontWeight: 700, textAlign: 'center', color: '#A8B3C2' }}>{r.name}</span>)}
          </div>
          {d.modules.map((module: string) => (
            <div key={module} style={{ display: 'grid', gridTemplateColumns: `1.4fr repeat(${d.roles.length},1fr)`, gap: 8, alignItems: 'center', padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{module}</span>
              {d.matrix.map((row: any) => {
                const cell = row.cells.find((c: any) => c.module === module);
                const on = cell?.allowed; const locked = cell?.locked;
                return (
                  <div key={row.roleId} style={{ display: 'flex', justifyContent: 'center' }}>
                    <button onClick={() => { if (locked) { notify('Super Admin has full access', '🛡'); return; } setPerm.mutate({ roleId: row.roleId, module, allowed: !on }); }}
                      style={{ cursor: locked ? 'not-allowed' : 'pointer', width: 26, height: 26, borderRadius: 8, border: `1px solid ${on ? (locked ? 'rgba(244,197,66,.4)' : 'rgba(0,200,83,.4)') : 'rgba(255,255,255,.1)'}`, background: on ? (locked ? 'rgba(244,197,66,.18)' : 'rgba(0,200,83,.16)') : 'rgba(255,255,255,.03)', color: locked ? '#F4C542' : '#00C853', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{on ? '✓' : ''}</button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {teamModal && (
        <CrudModal
          title={teamModal === 'new' ? 'Add team member' : `Edit ${(teamModal as any).name}`}
          fields={teamFields}
          initial={teamModal === 'new' ? { name: '', email: '', password: '', teamRole: (roleOptions.find((o: any) => o.value !== 'SUPER_ADMIN')?.value ?? roleOptions[0]?.value), status: 'ACTIVE' } : teamModal}
          onClose={() => setTeamModal(null)} onSubmit={(b) => { if (teamModal !== 'new' && !b.password) delete b.password; saveTeam.mutate(b); }} submitting={saveTeam.isPending}
        />
      )}
    </div>
  );
}

/* ── Audit logs ────────────────────────────────────────────────────────── */
function AuditView() {
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['admin', 'audit'], queryFn: () => adminApi.audit({ pageSize: 50 }) });
  if (isLoading) return <Loading variant="table" />;
  if (isError || !data) return <ErrorState message="Could not load audit logs." onRetry={() => refetch()} />;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}><div style={{ fontSize: 13, color: '#A8B3C2' }}>Every admin action is logged for security & compliance.</div></div>
      <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,.08)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 2fr 1fr 1fr', gap: 12, padding: '12px 16px', background: 'rgba(255,255,255,.04)', fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: '#6b7686' }}><span>Who</span><span>Action</span><span>Change</span><span>IP</span><span>When</span></div>
        {data.data.map((l: any) => (
          <div key={l.id} className="arow" style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 2fr 1fr 1fr', gap: 12, padding: '13px 16px', borderTop: '1px solid rgba(255,255,255,.06)', alignItems: 'center', fontSize: 12.5 }}>
            <span style={{ fontWeight: 600 }}>{l.actorName}</span>
            <span><Pill status={l.action} /></span>
            <span style={{ color: '#A8B3C2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.change}</span>
            <span style={{ color: '#6b7686', fontFamily: 'Sora', fontSize: 11.5 }}>{l.ip ?? '—'}</span>
            <span style={{ color: '#6b7686', fontSize: 11.5 }}>{relativeTime(l.createdAt)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── SEO ───────────────────────────────────────────────────────────────── */
function SeoView({ notify }: { notify: Notify }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'settings', 'seo'], queryFn: () => adminApi.settings('seo') });
  const [form, setForm] = useState<Record<string, string>>({});
  useMemo(() => { if (data) setForm(Object.fromEntries((data as any[]).map((s) => [s.key, s.value ?? '']))); }, [data]);
  const save = useMutation({ mutationFn: () => adminApi.updateSettings('seo', form), onSuccess: () => { notify('SEO saved', '✅'); qc.invalidateQueries({ queryKey: ['admin', 'settings', 'seo'] }); } });
  if (isLoading) return <Loading />;
  const checks = ['Title within 60 characters', 'Meta description set', 'Open Graph image added', 'Canonical URL configured'];
  return (
    <div className="col2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
      <div style={{ padding: 22, borderRadius: 16, ...card }}>
        <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 15, marginBottom: 6 }}>SEO settings</div>
        <div style={{ fontSize: 12, color: '#6b7686', marginBottom: 16 }}>Editing: <b style={{ color: '#fff' }}>Landing page</b></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          <div><label style={lbl}>SEO title</label><input value={form.title ?? ''} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} style={inp} /></div>
          <div><label style={lbl}>Meta description</label><textarea rows={3} value={form.description ?? ''} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} style={{ ...inp, resize: 'none' }} /></div>
          <div><label style={lbl}>Keywords</label><input value={form.keywords ?? ''} onChange={(e) => setForm((f) => ({ ...f, keywords: e.target.value }))} style={inp} /></div>
          <button onClick={() => save.mutate()} style={{ ...primaryBtn, alignSelf: 'flex-start', borderRadius: 10, padding: '11px 20px' }}>Save SEO</button>
        </div>
      </div>
      <div style={{ padding: 22, borderRadius: 16, ...card }}>
        <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Search preview</div>
        <div style={{ padding: 16, borderRadius: 12, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)' }}>
          <div style={{ fontSize: 12, color: '#36b6c9' }}>gwlhub.com</div>
          <div style={{ fontSize: 17, color: '#9db4ff', margin: '3px 0 5px' }}>{form.title || 'GWL Creators Hub — Premium Digital Assets'}</div>
          <div style={{ fontSize: 12.5, color: '#A8B3C2', lineHeight: 1.5 }}>{form.description || 'Premium digital assets for creators, freelancers and businesses.'}</div>
        </div>
        <div style={{ marginTop: 16, fontFamily: 'Sora', fontWeight: 700, fontSize: 14, marginBottom: 10 }}>Checklist</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {checks.map((c) => <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 12.5, color: '#dfe5ee' }}><span style={{ color: '#00C853' }}>✓</span>{c}</div>)}
        </div>
      </div>
    </div>
  );
}

/* ── Settings ──────────────────────────────────────────────────────────── */
const settingsTabs: [string, string][] = [['general', 'General'], ['payments', 'Payments'], ['email', 'Email'], ['membership', 'Membership'], ['security', 'Security']];
const settingsTitle: Record<string, string> = { general: 'General', payments: 'Payment gateway', email: 'Email (SMTP)', membership: 'Membership', security: 'Security' };

function SettingsView({ notify }: { notify: Notify }) {
  const qc = useQueryClient();
  const [tab, setTab] = useState('general');
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'settings', tab], queryFn: () => adminApi.settings(tab) });
  const { data: toggles } = useQuery({ queryKey: ['admin', 'settings', 'toggles'], queryFn: () => adminApi.settings('toggles') });
  const [form, setForm] = useState<Record<string, string>>({});
  useMemo(() => { if (data) setForm(Object.fromEntries((data as any[]).map((s) => [s.key, s.value ?? '']))); }, [data]);

  const save = useMutation({ mutationFn: () => adminApi.updateSettings(tab, form), onSuccess: () => { notify('Settings saved', '✅'); qc.invalidateQueries({ queryKey: ['admin', 'settings', tab] }); } });
  const toggleSave = useMutation({ mutationFn: (vals: Record<string, string>) => adminApi.updateSettings('toggles', vals), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'settings', 'toggles'] }) });

  const seg = (active: boolean) => ({ background: active ? 'rgba(42,150,166,.16)' : 'rgba(255,255,255,.04)', border: `1px solid ${active ? 'rgba(42,150,166,.45)' : 'rgba(255,255,255,.1)'}`, color: active ? '#fff' : '#A8B3C2' });
  const toggleList = (toggles as any[]) ?? [];

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        {settingsTabs.map(([k, label]) => <button key={k} onClick={() => setTab(k)} style={{ cursor: 'pointer', padding: '8px 15px', borderRadius: 10, fontSize: 12.5, fontWeight: 600, ...seg(tab === k) }}>{label}</button>)}
      </div>
      <div className="col2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <div style={{ padding: 22, borderRadius: 16, ...card }}>
          <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>{settingsTitle[tab]}</div>
          {isLoading ? <Loading /> : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                {(data as any[]).map((sf) => (
                  <div key={sf.key}><label style={lbl}>{sf.label}</label><input value={form[sf.key] ?? ''} onChange={(e) => setForm((f) => ({ ...f, [sf.key]: e.target.value }))} style={inp} /></div>
                ))}
              </div>
              <button onClick={() => save.mutate()} style={{ ...primaryBtn, borderRadius: 10, marginTop: 16 }}>Save {settingsTitle[tab]}</button>
            </>
          )}
        </div>
        <div style={{ padding: 22, borderRadius: 16, ...card }}>
          <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Toggles</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {toggleList.map((tg) => {
              const on = tg.value === 'true';
              return (
                <div key={tg.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 12px', borderRadius: 10, background: 'rgba(255,255,255,.03)' }}>
                  <div><div style={{ fontSize: 13, fontWeight: 600 }}>{tg.label}</div></div>
                  <Toggle on={on} onClick={() => toggleSave.mutate({ [tg.key]: on ? 'false' : 'true' })} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
