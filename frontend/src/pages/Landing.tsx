import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Seo } from '@/components/Seo';

/* ── Static marketing content — ported verbatim from the approved prototype ── */

interface BuyItem { name: string; icon: string; desc: string; original: string; offer: string; member: string }

const vaultData = [
  { icon: '🎬', name: 'Luxury Videos Hub', count: '20,000+', unit: 'HQ videos', tagline: 'All 4 packs combined — Reels, Shorts & Ads ready.', highlights: ['20,000+ videos for ₹699', 'Full commercial license', 'Lifetime updates'], saves: '200+ hrs', accent: '#F4C542' },
  { icon: '💡', name: 'Ideas Hub', count: '3,500+', unit: 'product ideas', tagline: 'AI-ready ideas you can build today.', highlights: ['14 categories', 'AI prompt per idea', 'Tamil & English'], saves: '120+ hrs', accent: '#36b6c9' },
  { icon: '🌐', name: 'Websites Hub', count: '141', unit: 'templates', tagline: 'Launch-ready React sites for any niche.', highlights: ['Live preview', 'Full source code', 'SEO optimized'], saves: '300+ hrs', accent: '#7c8bff' },
  { icon: '📦', name: 'Creators Research Hub', count: '1 TB+', unit: 'real products', tagline: 'Study what already works. Build better.', highlights: ['100s of categories', 'Courses, eBooks, templates', 'Instant access'], saves: '500+ hrs', accent: '#7c4dff' },
  { icon: '⌨️', name: 'Shortcuts Hub', count: '100+', unit: 'software', tagline: 'Work faster. Click less. Achieve more.', highlights: ['Windows & macOS', 'Printable cheat sheets', 'Pro levels'], saves: '80+ hrs', accent: '#00C853' },
];
const tickerData = [
  { who: 'Priya M.', act: 'unlocked Ideas Hub', city: 'Chennai' },
  { who: 'Arjun K.', act: 'grabbed the Creator Mega Bundle', city: 'Bengaluru' },
  { who: 'Rahul S.', act: 'became a Lifetime Member', city: 'Mumbai' },
  { who: 'Sneha R.', act: 'got the Websites Hub', city: 'Pune' },
  { who: 'Vikram J.', act: 'unlocked the Shortcuts Hub', city: 'Delhi' },
];
const statsBase = [
  { target: 20000, suffix: '+', label: 'Premium Videos' },
  { target: 3500, suffix: '+', label: 'Business Ideas' },
  { target: 141, suffix: '+', label: 'Website Templates' },
  { target: 100, suffix: '+', label: 'Software Shortcuts' },
];
const productCards = [
  { name: 'Luxury Videos Hub', category: 'Premium Videos · All Packs', tag: '20,000+ HQ VIDEOS', desc: 'All 4 video packs combined — 20,000+ premium HQ videos for Reels, Shorts & Ads.', img: '/api/v1/assets/luxury-videos-hub/banner.png', bg: '#1a1206', original: '₹1,199', offer: '₹699', member: '₹699', save: '₹500', icon: '🎬' },
  { name: 'Creator Launch Pass', category: 'Premium Videos', tag: '365+ HQ VIDEOS', desc: '365+ premium HQ luxury videos — the perfect way to start creating.', img: '/api/v1/assets/creator-launch-pass/banner.png', bg: '#1a1206', original: '₹999', offer: '₹49', member: '₹49', save: '₹950', icon: '🚀' },
  { name: 'Starter Plan', category: 'Premium Videos', tag: '1,000+ HQ VIDEOS', desc: '1,000+ premium HQ videos for creators posting consistently.', img: '/api/v1/assets/starter/banner.png', bg: '#161206', original: '₹599', offer: '₹199', member: '₹199', save: '₹400', icon: '⭐' },
  { name: 'Creator Plan', category: 'Premium Videos', tag: '5,000+ HQ VIDEOS', desc: '5,000+ premium HQ videos — our most popular choice for serious creators.', img: '/api/v1/assets/creator/banner.png', bg: '#1a1606', original: '₹999', offer: '₹299', member: '₹299', save: '₹700', icon: '💎' },
  { name: 'Ultimate Plan', category: 'Premium Videos', tag: '15,000+ HQ VIDEOS', desc: '15,000+ premium HQ videos — the complete premium collection.', img: '/api/v1/assets/ultimate/banner.png', bg: '#1a1206', original: '₹1,499', offer: '₹499', member: '₹499', save: '₹1,000', icon: '👑' },
  { name: 'Ideas Hub', category: 'Digital Product Ideas', tag: '3,500+ IDEAS', desc: '3,500+ AI-ready digital product ideas across 14 categories — AI prompt per idea.', img: '/api/v1/assets/ideas-hub/banner.png', bg: '#06181a', original: '₹699', offer: '₹149', member: '₹129', save: '₹550', icon: '💡' },
  { name: 'Websites Hub', category: 'Premium Websites', tag: '141 TEMPLATES', desc: '141 industry website templates built with the latest React stack — live preview & source.', img: '/api/v1/assets/websites-hub/banner.png', bg: '#0a1418', original: '₹1,999', offer: '₹499', member: '₹449', save: '₹1,500', icon: '🌐' },
  { name: 'Creators Research Hub', category: 'Research Library', tag: '1 TB+ PRODUCTS', desc: '1TB+ of real digital products across hundreds of categories — research & learn.', img: '/api/v1/assets/creators-research-hub/banner.png', bg: '#12152a', original: '₹4,999', offer: '₹999', member: '₹899', save: '₹4,000', icon: '📦' },
  { name: 'Shortcuts Hub', category: 'Productivity', tag: '100+ SOFTWARE', desc: 'Keyboard shortcuts for 100+ software — Windows & macOS printable cheat sheets.', img: '/api/v1/assets/shortcuts-hub/banner.png', bg: '#12231a', original: '₹499', offer: '₹199', member: '₹179', save: '₹300', icon: '⌨️' },
];
const showcases = [
  { kicker: 'LUXURY VIDEOS HUB', title: '20,000+ premium videos. One pack.', desc: 'Get every video pack combined — 20,000+ professionally curated, commercial-ready HQ luxury videos organised and ready to post. The best value in one purchase.', features: ['20,000+ HQ videos — all 4 packs combined', 'Full commercial license included', 'Ready for Reels, Shorts & Ads', 'Instant download · lifetime updates'], img: '/api/v1/assets/luxury-videos-hub/cover.png', duration: '2:14', order: 1, imgOrder: 2, original: '₹1,199', offer: '₹699', discount: '42% OFF', item: { name: 'Luxury Videos Hub', icon: '🎬', desc: '20,000+ premium HQ videos (all packs)', original: '₹1,199', offer: '₹699', member: '₹699' } },
  { kicker: 'IDEAS HUB', title: '3,500+ ideas that actually sell.', desc: 'A curated library of 3,500+ AI-ready digital product ideas across 14 categories — in Tamil & English, with a ready-to-copy AI prompt for every idea.', features: ['3,500+ ideas across 14 categories', 'AI prompt included with every idea', 'Copy & expand with any AI', 'Tamil & English included'], img: '/api/v1/assets/ideas-hub/cover.png', duration: '1:48', order: 2, imgOrder: 1, original: '₹699', offer: '₹149', discount: '79% OFF', item: { name: 'Ideas Hub', icon: '💡', desc: '3,500+ AI-ready product ideas', original: '₹699', offer: '₹149', member: '₹129' } },
];
const bundles = [
  { name: 'Creator Mega Bundle', icon: '🚀', badge: 'BEST VALUE', includes: 'Luxury Videos Hub + Ideas Hub + Shortcuts Hub', original: '₹1,847', price: '₹699', item: { name: 'Creator Mega Bundle', icon: '🚀', desc: '3 products bundled', original: '₹1,847', offer: '₹699', member: '₹699' } },
  { name: 'Business Starter Bundle', icon: '💼', badge: 'POPULAR', includes: 'Ideas Hub + Websites Hub + Creators Research Hub', original: '₹7,697', price: '₹1,499', item: { name: 'Business Starter Bundle', icon: '💼', desc: '3 products bundled', original: '₹7,697', offer: '₹1,499', member: '₹1,499' } },
  { name: 'Ultimate Creator Bundle', icon: '👑', badge: 'NEW', includes: 'Luxury Videos Hub + Websites Hub + Ideas Hub', original: '₹2,647', price: '₹999', item: { name: 'Ultimate Creator Bundle', icon: '👑', desc: '3 products bundled', original: '₹2,647', offer: '₹999', member: '₹999' } },
];
const whyCards = [
  { icon: '⏱️', title: 'Save Hundreds of Hours', desc: 'Skip the hunt. Everything is curated, organised and ready to use.' },
  { icon: '🎯', title: 'Professionally Curated', desc: 'Hand-picked premium quality across every vault and category.' },
  { icon: '📜', title: 'Commercial Usage', desc: 'Full license for personal and unlimited client projects.' },
  { icon: '⚡', title: 'Instant Access', desc: 'Download in seconds — no waiting, no friction.' },
  { icon: '🔄', title: 'Lifetime Updates', desc: 'New content added regularly, free for you forever.' },
  { icon: '💎', title: 'Premium Quality', desc: 'Built to a billion-dollar SaaS standard, not a template.' },
  { icon: '💸', title: 'Affordable Pricing', desc: 'Founder pricing today — a fraction of doing it yourself.' },
  { icon: '🚀', title: 'Future Ready', desc: 'New vaults and bonuses drop continuously for members.' },
];
const trustAvatars = [
  { initial: 'A', bg: '#2A96A6' }, { initial: 'R', bg: '#D4A017' }, { initial: 'S', bg: '#7c4dff' },
  { initial: 'M', bg: '#00C853' }, { initial: 'K', bg: '#ff5252' }, { initial: 'P', bg: '#36b6c9' },
];
const trustStats = [
  { value: '12,000+', label: 'Happy customers' }, { value: '₹2.4Cr+', label: 'Customer savings' },
  { value: '38', label: 'Countries served' }, { value: '99.2%', label: 'Satisfaction rate' },
];
const memberBenefits = ['Member pricing on all products', 'Exclusive bonus product drops', 'Early access to new vaults', 'Priority 24×7 support', 'Private creator community', 'Lifetime — no renewals ever'];
const faqData = [
  { q: 'Do I need an account to buy?', a: 'No. You can purchase any product as a guest — no signup required. After payment your download is delivered instantly via email.' },
  { q: 'What does the commercial license cover?', a: 'Every product includes a full commercial license. Use the assets in unlimited personal and client projects, with no attribution required.' },
  { q: 'How do lifetime updates work?', a: 'When a vault gets new content or a new version, you get it free — forever. Members are notified first and get early access.' },
  { q: 'What is the membership and is it required?', a: 'Membership is a one-time ₹39 upsell, never required. It unlocks automatic member pricing, bonus drops, early access and priority support.' },
  { q: 'How do refunds work?', a: "Because these are instant-download digital products, we handle refunds case-by-case. Reach out via the Help button and we'll make it right." },
];
const drawerData = [
  { q: 'How do I download my files?', a: "After purchase you'll receive an email with secure download links. Members can also re-download anytime from their dashboard." },
  { q: 'Which payment methods do you accept?', a: 'All major cards, UPI and net banking via our secure external payment gateway.' },
  { q: 'Can I use products for client work?', a: 'Yes — the commercial license covers unlimited client projects.' },
  { q: 'Do prices include taxes?', a: 'All displayed prices are final. Applicable taxes, if any, are shown at checkout.' },
  { q: 'How do I become a member?', a: "Add membership at any checkout for ₹39, or use the Become a Member button. You'll get a signup link right after." },
  { q: 'How fast is support?', a: 'We typically reply within 2 hours during business hours via WhatsApp or email.' },
];
const recentBuys = [
  { initial: 'R', bg: '#2A96A6', who: 'Rahul S.', what: 'Ideas Hub', when: '2m ago' },
  { initial: 'P', bg: '#D4A017', who: 'Priya M.', what: 'Luxury Videos Hub', when: '6m ago' },
  { initial: 'A', bg: '#7c4dff', who: 'Arjun K.', what: 'Business Bundle', when: '11m ago' },
];
const footCols = [
  { title: 'Products', links: ['Luxury Videos Hub', 'Ideas Hub', 'Websites Hub', 'Creators Research Hub', 'Shortcuts Hub', 'Bundles'] },
  { title: 'Support', links: ['Help Center', 'Contact', 'FAQ', 'Track Order', 'Downloads'] },
  { title: 'Legal', links: ['Privacy Policy', 'Refund Policy', 'Terms', 'License', 'DMCA'] },
];

const hexA = (hex: string, a: number) => { const n = parseInt(hex.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; };
const fmt = (n: number) => (n >= 1000 ? (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'k' : '' + n);
const pad = (n: number) => String(n).padStart(2, '0');
const shortName = (name: string) => name.replace('Creators Research Hub', 'Research').replace('Luxury Videos Hub', 'Videos').replace(' Hub', '');

export default function Landing() {
  const navigate = useNavigate();

  const [faqOpen, setFaqOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [buyOpen, setBuyOpen] = useState(false);
  const [buyStep, setBuyStep] = useState(1);
  const [buyItem, setBuyItem] = useState<BuyItem | null>(null);
  const [openFaqIdx, setOpenFaqIdx] = useState(-1);
  const [openDrawerIdx, setOpenDrawerIdx] = useState(-1);
  const [faqSearch, setFaqSearch] = useState('');
  const [toast, setToast] = useState('');
  const [toastIcon, setToastIcon] = useState('✓');
  const [seconds, setSeconds] = useState(8 * 3600 + 42 * 60 + 17);
  const [activeVault, setActiveVault] = useState(0);
  const [tickerIdx, setTickerIdx] = useState(0);
  const [liveCount, setLiveCount] = useState(12480);
  const [counts, setCounts] = useState<number[]>(statsBase.map(() => 0));
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();

  // animated counters
  useEffect(() => {
    const dur = 1500, t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      setCounts(statsBase.map((s) => Math.round(s.target * e)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // countdown + hub auto-advance
  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    const hub = setInterval(() => {
      setActiveVault((v) => (v + 1) % vaultData.length);
      setTickerIdx((t) => (t + 1) % tickerData.length);
      setLiveCount((c) => c + Math.floor(Math.random() * 3));
    }, 3200);
    return () => { clearInterval(timer); clearInterval(hub); };
  }, []);

  function showToast(msg: string, icon = '✓') {
    setToast(msg); setToastIcon(icon);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2600);
  }
  function buy(item: BuyItem) { setBuyItem(item); setBuyStep(1); setBuyOpen(true); }
  function goPay() { setBuyStep(2); setTimeout(() => setBuyStep(3), 1800); }
  function scrollTo(id: string) { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); }
  function openMembership() { setBuyOpen(false); scrollTo('membership'); showToast('Membership — ₹39 lifetime', '👑'); }

  const h = Math.floor(seconds / 3600), m = Math.floor((seconds % 3600) / 60), sec = seconds % 60;
  const countdown = `${pad(h)}:${pad(m)}:${pad(sec)}`;
  const av = vaultData[activeVault];
  const tk = tickerData[tickerIdx];
  const item = buyItem ?? { name: '', icon: '', desc: '', original: '', offer: '', member: '' };

  return (
    <>
      <Seo
        title="GWL Creators Hub — Create Faster. Grow Smarter."
        path="/"
        jsonLd={[
          { '@context': 'https://schema.org', '@type': 'Organization', name: 'GWL Creators Hub', url: typeof window !== 'undefined' ? window.location.origin : 'https://gwlhub.com', logo: '/assets/gwl-logo.png' },
          { '@context': 'https://schema.org', '@type': 'WebSite', name: 'GWL Creators Hub', url: typeof window !== 'undefined' ? window.location.origin : 'https://gwlhub.com' },
        ]}
      />
      <div style={{ minHeight: '100vh', position: 'relative', overflowX: 'clip' }}>
        {/* ambient glows */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <div style={{ position: 'absolute', top: '-12%', left: '8%', width: 620, height: 620, borderRadius: '50%', background: 'radial-gradient(circle,rgba(42,150,166,.20),transparent 65%)', filter: 'blur(20px)' }} />
          <div style={{ position: 'absolute', top: '30%', right: '-6%', width: 560, height: 560, borderRadius: '50%', background: 'radial-gradient(circle,rgba(212,160,23,.16),transparent 65%)', filter: 'blur(20px)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: '30%', width: 680, height: 520, borderRadius: '50%', background: 'radial-gradient(circle,rgba(42,150,166,.10),transparent 70%)', filter: 'blur(30px)' }} />
        </div>

        {/* TOP NAV */}
        <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 60, backdropFilter: 'blur(18px)', background: 'rgba(11,15,20,.72)', borderBottom: '1px solid rgba(255,255,255,.07)' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
            <a href="#top" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
              <img src="/assets/gwl-logo.png" alt="GWL" style={{ width: 42, height: 42, borderRadius: 11, objectFit: 'cover' }} />
              <span style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 18, letterSpacing: '-.02em', color: '#fff' }}>GWL <span style={{ color: '#F4C542' }}>Creators Hub</span></span>
            </a>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="livechip" style={{ display: 'none', alignItems: 'center', gap: 8, padding: '7px 13px', borderRadius: 999, background: 'rgba(0,200,83,.1)', border: '1px solid rgba(0,200,83,.25)' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#00C853', boxShadow: '0 0 8px #00C853', animation: 'pulseGlow 1.6s infinite' }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#7Cffb0' }}>2,418 online</span>
              </div>
              <button onClick={() => navigate('/signin')} className="nav-signin" style={{ cursor: 'pointer', fontFamily: '"Plus Jakarta Sans"', fontWeight: 600, fontSize: 14, color: '#fff', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 999, padding: '10px 20px', transition: 'all .2s' }}>Sign In</button>
            </div>
          </div>
        </header>
        <div id="top" />

        {/* HERO */}
        <section className="herogrid" style={{ position: 'relative', zIndex: 1, maxWidth: 1280, margin: '0 auto', padding: '140px 28px 40px', display: 'grid', gridTemplateColumns: '1.05fr .95fr', gap: 48, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '7px 14px', borderRadius: 999, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', marginBottom: 26 }}>
              <span style={{ fontSize: 13 }}>🔥</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#A8B3C2' }}>Trusted by 12,000+ creators worldwide</span>
            </div>
            <h1 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 64, lineHeight: 1.02, letterSpacing: '-.035em', marginBottom: 22 }}>
              Create Faster.<br /><span style={{ background: 'linear-gradient(100deg,#2A96A6,#F4C542)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Grow Smarter.</span>
            </h1>
            <p style={{ fontSize: 18, lineHeight: 1.6, color: '#A8B3C2', maxWidth: 520, marginBottom: 30 }}>Premium digital assets designed for creators, freelancers and businesses. Save hundreds of hours with ready-to-use videos, premium websites, AI prompts, business ideas and exclusive creator resources.</p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 30 }}>
              <button onClick={() => scrollTo('products')} className="btn-primary" style={{ cursor: 'pointer', fontFamily: 'Sora', fontWeight: 700, fontSize: 16, color: '#06222a', background: 'linear-gradient(95deg,#2A96A6,#36b6c9)', border: 'none', borderRadius: 14, padding: '16px 30px', boxShadow: '0 12px 30px -8px rgba(42,150,166,.6)' }}>Explore Products →</button>
              <button onClick={openMembership} style={{ cursor: 'pointer', fontFamily: 'Sora', fontWeight: 700, fontSize: 16, color: '#fff', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.16)', borderRadius: 14, padding: '16px 28px', backdropFilter: 'blur(8px)' }}>Become Lifetime Member</button>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {['Commercial License', 'Instant Download', 'Lifetime Updates', 'Premium Quality', '24×7 Support'].map((chip) => (
                <div key={chip} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 13px', borderRadius: 999, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)' }}>
                  <span style={{ color: '#2A96A6', fontSize: 14 }}>✓</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#A8B3C2' }}>{chip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* hero visual: interactive Hub catalog panel */}
          <div className="herovisual" style={{ position: 'relative', minHeight: 480, display: 'flex', alignItems: 'center' }}>
            <div style={{ position: 'absolute', top: 0, right: '-4%', width: 340, height: 340, borderRadius: '50%', background: `radial-gradient(circle,${hexA(av.accent, 0.22)},transparent 68%)`, filter: 'blur(34px)', transition: 'background .5s' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle,rgba(42,150,166,.18),transparent 68%)', filter: 'blur(30px)' }} />
            <div style={{ position: 'absolute', top: -14, right: 6, zIndex: 4, background: 'rgba(11,15,20,.85)', backdropFilter: 'blur(10px)', border: '1px solid rgba(244,197,66,.3)', borderRadius: 14, padding: '10px 16px', boxShadow: '0 16px 36px -12px rgba(0,0,0,.7)', animation: 'floaty 6s ease-in-out infinite' }}>
              <div style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 20, color: '#F4C542', lineHeight: 1 }}>25,000+</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#A8B3C2', marginTop: 2 }}>premium assets, one hub</div>
            </div>

            <div style={{ position: 'relative', zIndex: 2, width: '100%', background: 'linear-gradient(155deg,rgba(26,36,48,.92),rgba(13,19,26,.92))', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 22, boxShadow: '0 40px 80px -28px rgba(0,0,0,.85)', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 18px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <img src="/assets/gwl-logo.png" alt="GWL" style={{ width: 30, height: 30, borderRadius: 8, objectFit: 'cover' }} />
                  <span style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 14 }}>Inside the Hub</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 11px', borderRadius: 999, background: 'rgba(0,200,83,.1)', border: '1px solid rgba(0,200,83,.25)' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00C853', boxShadow: '0 0 7px #00C853', animation: 'pulseGlow 1.6s infinite' }} />
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: '#7Cffb0' }}>{liveCount.toLocaleString('en-IN')} creators inside</span>
                </div>
              </div>

              <div style={{ padding: '22px 20px 18px', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
                  <div style={{ width: 54, height: 54, borderRadius: 14, background: hexA(av.accent, 0.14), border: `1px solid ${hexA(av.accent, 0.22)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0, transition: 'all .4s' }}>{av.icon}</div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 9, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 20, letterSpacing: '-.02em' }}>{av.name}</span>
                      <span style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 15, color: av.accent, transition: 'color .4s' }}>{av.count} {av.unit}</span>
                    </div>
                    <div style={{ fontSize: 13.5, color: '#A8B3C2', marginTop: 3 }}>{av.tagline}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                  {av.highlights.map((hl) => (
                    <span key={hl} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 11px', borderRadius: 9, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', fontSize: 12.5, fontWeight: 600, color: '#dfe5ee' }}>
                      <span style={{ color: '#00C853', fontSize: 11 }}>✓</span>{hl}
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 14px', borderRadius: 13, background: hexA(av.accent, 0.14), border: `1px solid ${hexA(av.accent, 0.22)}`, transition: 'all .4s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <span style={{ fontSize: 17 }}>⏱️</span>
                    <span style={{ fontSize: 13, color: '#dfe5ee' }}>Saves you about</span>
                    <span style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 16, color: av.accent, transition: 'color .4s' }}>{av.saves}</span>
                  </div>
                  <button onClick={() => scrollTo('products')} style={{ cursor: 'pointer', fontFamily: 'Sora', fontWeight: 700, fontSize: 12.5, color: '#06222a', background: '#fff', border: 'none', borderRadius: 9, padding: '8px 14px', whiteSpace: 'nowrap' }}>View →</button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 7, padding: '0 16px 14px' }}>
                {vaultData.map((v, i) => (
                  <button key={v.name} onClick={() => setActiveVault(i)} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: '10px 4px', borderRadius: 11, background: i === activeVault ? hexA(v.accent, 0.16) : 'rgba(255,255,255,.04)', border: `1px solid ${i === activeVault ? hexA(v.accent, 0.5) : 'rgba(255,255,255,.08)'}`, color: i === activeVault ? '#fff' : '#A8B3C2', transition: 'all .25s' }}>
                    <span style={{ fontSize: 18 }}>{v.icon}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, textAlign: 'center', lineHeight: 1.1 }}>{shortName(v.name)}</span>
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 18px', borderTop: '1px solid rgba(255,255,255,.08)', background: 'rgba(0,0,0,.2)' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#00C853', boxShadow: '0 0 8px #00C853', flexShrink: 0, animation: 'pulseGlow 1.6s infinite' }} />
                <span style={{ fontSize: 12.5, color: '#A8B3C2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tk.who} · {tk.city} {tk.act}</span>
              </div>
            </div>
          </div>
        </section>

        {/* STATS BAR */}
        <section style={{ position: 'relative', zIndex: 1, maxWidth: 1280, margin: '30px auto 0', padding: '0 28px' }}>
          <div className="statsgrid" style={{ borderTop: '1px solid rgba(255,255,255,.08)', borderBottom: '1px solid rgba(255,255,255,.08)', padding: '36px 0', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
            {statsBase.map((b, i) => (
              <div key={b.label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 42, letterSpacing: '-.03em', background: 'linear-gradient(120deg,#fff,#A8B3C2)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{fmt(counts[i])}{b.suffix}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#A8B3C2', marginTop: 4 }}>{b.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* MAIN + STICKY SIDEBAR */}
        <div className="mainwrap" style={{ position: 'relative', zIndex: 1, maxWidth: 1280, margin: '0 auto', padding: '0 28px', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 36, alignItems: 'start' }}>
          <main style={{ minWidth: 0 }}>
            {/* WHY GWL */}
            <section style={{ padding: '84px 0 30px' }}>
              <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: '#2A96A6', marginBottom: 14 }}>Why GWL</div>
                <h2 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 42, letterSpacing: '-.03em', lineHeight: 1.08 }}>Everything you need.<br />Nothing you don't.</h2>
              </div>
              <div className="why4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
                {whyCards.map((c) => (
                  <div key={c.title} className="why-card" style={{ padding: 24, borderRadius: 18, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', transition: 'all .25s', cursor: 'default' }}>
                    <div style={{ width: 46, height: 46, borderRadius: 12, background: 'rgba(42,150,166,.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 16 }}>{c.icon}</div>
                    <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 16, marginBottom: 7 }}>{c.title}</div>
                    <div style={{ fontSize: 13.5, lineHeight: 1.55, color: '#A8B3C2' }}>{c.desc}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* TRUST */}
            <section style={{ padding: '50px 0' }}>
              <div style={{ borderRadius: 24, background: 'linear-gradient(135deg,rgba(42,150,166,.1),rgba(212,160,23,.07))', border: '1px solid rgba(255,255,255,.1)', padding: '42px 38px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24, marginBottom: 30 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                      <span style={{ color: '#F4C542', fontSize: 20, letterSpacing: 2 }}>★★★★★</span>
                      <span style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 18, marginLeft: 8 }}>4.9/5</span>
                    </div>
                    <div style={{ fontSize: 14, color: '#A8B3C2' }}>from 3,200+ verified customer reviews</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {trustAvatars.map((a, i) => (
                      <div key={i} style={{ width: 42, height: 42, borderRadius: '50%', marginLeft: -10, border: '2px solid #0B0F14', background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Sora', fontWeight: 700, fontSize: 14, color: '#fff' }}>{a.initial}</div>
                    ))}
                    <div style={{ marginLeft: 6, fontSize: 13, fontWeight: 600, color: '#A8B3C2' }}>+12k members</div>
                  </div>
                </div>
                <div className="trust4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18, borderTop: '1px solid rgba(255,255,255,.1)', paddingTop: 28 }}>
                  {trustStats.map((t) => (
                    <div key={t.label}>
                      <div style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 26, color: '#F4C542' }}>{t.value}</div>
                      <div style={{ fontSize: 13, color: '#A8B3C2', marginTop: 2 }}>{t.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* FEATURED PRODUCTS */}
            <section id="products" style={{ padding: '50px 0 30px', scrollMarginTop: 90 }}>
              <div style={{ marginBottom: 34 }}>
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: '#2A96A6', marginBottom: 12 }}>Featured Products</div>
                <h2 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 40, letterSpacing: '-.03em' }}>Premium vaults, ready to use</h2>
              </div>
              <div className="prodgrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 20 }}>
                {productCards.map((p) => (
                  <div key={p.name} className="prod-card" style={{ borderRadius: 20, overflow: 'hidden', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.09)', transition: 'all .28s', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden', background: p.bg }}>
                      <img src={p.img} alt={p.name} loading="lazy" decoding="async" className="img-fade" ref={(el) => { if (el?.complete) el.classList.add('is-loaded'); }} onLoad={(e) => e.currentTarget.classList.add('is-loaded')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', top: 12, left: 12, padding: '5px 11px', borderRadius: 999, background: 'rgba(11,15,20,.8)', backdropFilter: 'blur(6px)', fontSize: 11, fontWeight: 700, letterSpacing: '.04em', color: '#F4C542', border: '1px solid rgba(244,197,66,.3)' }}>{p.tag}</div>
                    </div>
                    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#2A96A6', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>{p.category}</div>
                      <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 21, marginBottom: 8 }}>{p.name}</div>
                      <div style={{ fontSize: 13.5, lineHeight: 1.5, color: '#A8B3C2', marginBottom: 16, flex: 1 }}>{p.desc}</div>
                      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 24, color: '#fff' }}>{p.offer}</span>
                            <span style={{ fontSize: 14, color: '#6b7686', textDecoration: 'line-through' }}>{p.original}</span>
                          </div>
                          <div style={{ fontSize: 12, color: '#00C853', fontWeight: 600, marginTop: 2 }}>Member {p.member} · Save {p.save}</div>
                        </div>
                        <button onClick={() => buy({ name: p.name, icon: p.icon, desc: p.desc, original: p.original, offer: p.offer, member: p.member })} style={{ cursor: 'pointer', fontFamily: 'Sora', fontWeight: 700, fontSize: 14, color: '#06222a', background: 'linear-gradient(95deg,#F4C542,#D4A017)', border: 'none', borderRadius: 11, padding: '11px 18px', whiteSpace: 'nowrap' }}>Buy Now</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* SHOWCASES */}
            {showcases.map((sh) => (
              <section key={sh.kicker} style={{ padding: '54px 0', borderTop: '1px solid rgba(255,255,255,.07)' }}>
                <div className="showgrid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center' }}>
                  <div style={{ order: sh.order }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 13px', borderRadius: 999, background: 'rgba(42,150,166,.12)', border: '1px solid rgba(42,150,166,.3)', marginBottom: 18 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#36b6c9', letterSpacing: '.05em' }}>{sh.kicker}</span>
                    </div>
                    <h3 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 34, lineHeight: 1.1, letterSpacing: '-.025em', marginBottom: 14 }}>{sh.title}</h3>
                    <p style={{ fontSize: 16, lineHeight: 1.6, color: '#A8B3C2', marginBottom: 22 }}>{sh.desc}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 26 }}>
                      {sh.features.map((f) => (
                        <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                          <span style={{ width: 22, height: 22, borderRadius: 7, background: 'rgba(0,200,83,.15)', color: '#00C853', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>✓</span>
                          <span style={{ fontSize: 14.5, color: '#dfe5ee' }}>{f}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                        <span style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 30 }}>{sh.offer}</span>
                        <span style={{ fontSize: 15, color: '#6b7686', textDecoration: 'line-through' }}>{sh.original}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#06222a', background: '#F4C542', padding: '3px 9px', borderRadius: 7 }}>{sh.discount}</span>
                      </div>
                      <button onClick={() => buy(sh.item)} className="btn-primary" style={{ cursor: 'pointer', fontFamily: 'Sora', fontWeight: 700, fontSize: 15, color: '#06222a', background: 'linear-gradient(95deg,#2A96A6,#36b6c9)', border: 'none', borderRadius: 12, padding: '13px 26px', boxShadow: '0 10px 26px -8px rgba(42,150,166,.6)' }}>Buy Now →</button>
                    </div>
                  </div>
                  <div style={{ order: sh.imgOrder, position: 'relative' }}>
                    <div style={{ position: 'absolute', inset: -20, background: 'radial-gradient(circle,rgba(42,150,166,.18),transparent 70%)', filter: 'blur(30px)' }} />
                    <div style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', border: '1px solid rgba(255,255,255,.12)', boxShadow: '0 30px 60px -20px rgba(0,0,0,.8)', minHeight: 200, background: '#0a1418' }}>
                      <img src={sh.img} alt={sh.title} loading="lazy" decoding="async" className="img-fade" ref={(el) => { if (el?.complete) el.classList.add('is-loaded'); }} onLoad={(e) => e.currentTarget.classList.add('is-loaded')} style={{ width: '100%', display: 'block' }} />
                      <button onClick={() => showToast('Preview video — coming soon', '▶')} style={{ position: 'absolute', inset: 0, margin: 'auto', width: 64, height: 64, borderRadius: '50%', background: 'rgba(244,197,66,.95)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 30px rgba(0,0,0,.5)' }}>
                        <span style={{ fontSize: 22, marginLeft: 4 }}>▶</span>
                      </button>
                      <div style={{ position: 'absolute', bottom: 12, right: 12, padding: '5px 11px', borderRadius: 8, background: 'rgba(11,15,20,.85)', fontSize: 12, fontWeight: 600 }}>{sh.duration}</div>
                    </div>
                  </div>
                </div>
              </section>
            ))}

            {/* BUNDLES */}
            <section style={{ padding: '54px 0 30px', borderTop: '1px solid rgba(255,255,255,.07)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 30, flexWrap: 'wrap', gap: 14 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: '#D4A017', marginBottom: 12 }}>Bundle & Save</div>
                  <h2 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 38, letterSpacing: '-.03em' }}>Smarter together</h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 15px', borderRadius: 12, background: 'rgba(255,82,82,.1)', border: '1px solid rgba(255,82,82,.3)' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#ff7b7b' }}>⏳ Flash offer ends in</span>
                  <span style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 15, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>{countdown}</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {bundles.map((b) => (
                  <div key={b.name} className="bundlerow bundle-row" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 24, alignItems: 'center', padding: 22, borderRadius: 18, background: 'linear-gradient(100deg,rgba(212,160,23,.08),rgba(255,255,255,.03))', border: '1px solid rgba(244,197,66,.18)', transition: 'all .25s' }}>
                    <div style={{ width: 60, height: 60, borderRadius: 14, background: 'rgba(244,197,66,.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>{b.icon}</div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
                        <span style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 19 }}>{b.name}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#06222a', background: '#F4C542', padding: '2px 8px', borderRadius: 6 }}>{b.badge}</span>
                      </div>
                      <div style={{ fontSize: 13.5, color: '#A8B3C2' }}>{b.includes}</div>
                    </div>
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                        <span style={{ fontSize: 14, color: '#6b7686', textDecoration: 'line-through' }}>{b.original}</span>
                        <span style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 24, color: '#F4C542' }}>{b.price}</span>
                      </div>
                      <button onClick={() => buy(b.item)} style={{ cursor: 'pointer', fontFamily: 'Sora', fontWeight: 700, fontSize: 13, color: '#fff', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.18)', borderRadius: 10, padding: '9px 18px', transition: 'all .2s' }}>Buy Bundle</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* MEMBERSHIP */}
            <section id="membership" style={{ padding: '54px 0', scrollMarginTop: 90 }}>
              <div style={{ position: 'relative', borderRadius: 26, overflow: 'hidden', border: '1px solid rgba(244,197,66,.25)', padding: '50px 44px', background: 'linear-gradient(135deg,#121821,#0d1a1d)' }}>
                <div style={{ position: 'absolute', top: '-40%', right: '-10%', width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle,rgba(244,197,66,.16),transparent 65%)', filter: 'blur(20px)' }} />
                <div className="memgrid" style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1.2fr .8fr', gap: 40, alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 999, background: 'rgba(244,197,66,.14)', border: '1px solid rgba(244,197,66,.35)', marginBottom: 20 }}>
                      <span style={{ fontSize: 13 }}>👑</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#F4C542' }}>Lifetime Membership</span>
                    </div>
                    <h2 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 38, lineHeight: 1.1, letterSpacing: '-.03em', marginBottom: 14 }}>Unlock member pricing on everything</h2>
                    <p style={{ fontSize: 16, lineHeight: 1.6, color: '#A8B3C2', marginBottom: 24 }}>Join once, save forever. Members get automatic discounts, exclusive bonus drops, early access and priority support — all for a one-time fee.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}>
                      {memberBenefits.map((mb) => (
                        <div key={mb} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                          <span style={{ color: '#F4C542', fontSize: 15 }}>✦</span>
                          <span style={{ fontSize: 14, color: '#dfe5ee' }}>{mb}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ background: 'rgba(11,15,20,.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 20, padding: 30, textAlign: 'center' }}>
                    <div style={{ fontSize: 13, color: '#A8B3C2', marginBottom: 6 }}>One-time payment</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 6, marginBottom: 6 }}>
                      <span style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 54, color: '#fff' }}>₹39</span>
                      <span style={{ fontSize: 15, color: '#6b7686', textDecoration: 'line-through' }}>₹499</span>
                    </div>
                    <div style={{ fontSize: 13, color: '#00C853', fontWeight: 600, marginBottom: 22 }}>Lifetime access · No renewals</div>
                    <button onClick={openMembership} className="btn-primary" style={{ cursor: 'pointer', width: '100%', fontFamily: 'Sora', fontWeight: 700, fontSize: 16, color: '#06222a', background: 'linear-gradient(95deg,#F4C542,#D4A017)', border: 'none', borderRadius: 13, padding: 15, boxShadow: '0 12px 30px -8px rgba(244,197,66,.5)' }}>Become a Member</button>
                    <div style={{ fontSize: 12, color: '#6b7686', marginTop: 14 }}>🔒 Secure payment · Instant signup link</div>
                  </div>
                </div>
              </div>
            </section>

            {/* FAQ */}
            <section style={{ padding: '50px 0' }}>
              <div style={{ textAlign: 'center', marginBottom: 38 }}>
                <h2 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 36, letterSpacing: '-.03em' }}>Frequently asked questions</h2>
              </div>
              <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {faqData.map((f, i) => (
                  <div key={f.q} style={{ borderRadius: 14, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', overflow: 'hidden' }}>
                    <button onClick={() => setOpenFaqIdx((x) => (x === i ? -1 : i))} style={{ cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '18px 22px', background: 'none', border: 'none', textAlign: 'left' }}>
                      <span style={{ fontFamily: 'Sora', fontWeight: 600, fontSize: 16, color: '#fff' }}>{f.q}</span>
                      <span style={{ fontSize: 20, color: '#2A96A6', transition: 'transform .25s', transform: openFaqIdx === i ? 'rotate(45deg)' : 'rotate(0deg)', flexShrink: 0 }}>+</span>
                    </button>
                    <div style={{ maxHeight: openFaqIdx === i ? 300 : 0, overflow: 'hidden', transition: 'max-height .3s ease' }}>
                      <div style={{ padding: '0 22px 20px', fontSize: 14.5, lineHeight: 1.6, color: '#A8B3C2' }}>{f.a}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </main>

          {/* STICKY SIDEBAR */}
          <aside className="sidebar" style={{ position: 'sticky', top: 90, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ borderRadius: 18, overflow: 'hidden', border: '1px solid rgba(255,82,82,.3)', background: 'linear-gradient(135deg,rgba(255,82,82,.12),rgba(255,179,0,.08))' }}>
              <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(255,255,255,.08)' }}>
                <span style={{ fontSize: 15 }}>⚡</span>
                <span style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 14, color: '#ff9b6b' }}>Flash Sale — Live</span>
              </div>
              <div style={{ padding: 18 }}>
                <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 17, marginBottom: 6 }}>Creator Launch Pass</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 14 }}>
                  <span style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 26, color: '#F4C542' }}>₹49</span>
                  <span style={{ fontSize: 14, color: '#6b7686', textDecoration: 'line-through' }}>₹999</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#06222a', background: '#00C853', padding: '2px 7px', borderRadius: 6 }}>95% OFF</span>
                </div>
                <div style={{ textAlign: 'center', fontSize: 12, color: '#A8B3C2', marginBottom: 8 }}>Offer ends in</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 16 }}>
                  {[{ v: pad(h), l: 'hrs' }, { v: pad(m), l: 'min' }, { v: pad(sec), l: 'sec' }].map((cp) => (
                    <div key={cp.l} style={{ background: 'rgba(11,15,20,.7)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 9, padding: '8px 11px', textAlign: 'center', minWidth: 48 }}>
                      <div style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 19, fontVariantNumeric: 'tabular-nums' }}>{cp.v}</div>
                      <div style={{ fontSize: 10, color: '#6b7686', textTransform: 'uppercase' }}>{cp.l}</div>
                    </div>
                  ))}
                </div>
                <button onClick={() => buy({ name: 'Creator Launch Pass', icon: '🚀', desc: '365+ premium HQ luxury videos', original: '₹999', offer: '₹49', member: '₹49' })} style={{ cursor: 'pointer', width: '100%', fontFamily: 'Sora', fontWeight: 700, fontSize: 14, color: '#06222a', background: 'linear-gradient(95deg,#F4C542,#D4A017)', border: 'none', borderRadius: 11, padding: 12 }}>Grab the deal →</button>
              </div>
            </div>

            <div style={{ borderRadius: 18, border: '1px solid rgba(255,255,255,.09)', background: 'rgba(255,255,255,.04)', padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#00C853', boxShadow: '0 0 8px #00C853', animation: 'pulseGlow 1.6s infinite' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#A8B3C2' }}>Latest purchases</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {recentBuys.map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: r.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Sora', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{r.initial}</div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: '#dfe5ee', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.who}</div>
                      <div style={{ fontSize: 11, color: '#6b7686' }}>{r.what} · {r.when}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ borderRadius: 18, border: '1px solid rgba(244,197,66,.25)', background: 'linear-gradient(135deg,rgba(244,197,66,.1),rgba(42,150,166,.06))', padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 26, marginBottom: 8 }}>👑</div>
              <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Go Lifetime for ₹39</div>
              <div style={{ fontSize: 12.5, color: '#A8B3C2', marginBottom: 14 }}>Member pricing on every product, forever.</div>
              <button onClick={openMembership} style={{ cursor: 'pointer', width: '100%', fontFamily: 'Sora', fontWeight: 700, fontSize: 13, color: '#fff', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.18)', borderRadius: 10, padding: 11 }}>Become a Member</button>
            </div>
          </aside>
        </div>

        {/* FOOTER */}
        <footer style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,.08)', marginTop: 40, background: 'rgba(18,24,33,.5)' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '54px 28px 30px' }}>
            <div className="footgrid" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1fr', gap: 36, marginBottom: 40 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 16 }}>
                  <img src="/assets/gwl-logo.png" alt="GWL" style={{ width: 40, height: 40, borderRadius: 10 }} />
                  <span style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 17 }}>GWL <span style={{ color: '#F4C542' }}>Creators Hub</span></span>
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: '#A8B3C2', maxWidth: 300, marginBottom: 18 }}>Premium digital assets for creators, freelancers and businesses. Create faster, grow smarter.</p>
                <div style={{ display: 'flex', gap: 10 }}>
                  {['📷', '▶️', '✉️'].map((so, i) => (
                    <a key={i} href="#top" style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, textDecoration: 'none' }}>{so}</a>
                  ))}
                </div>
              </div>
              {footCols.map((col) => (
                <div key={col.title}>
                  <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 14, marginBottom: 16 }}>{col.title}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                    {col.links.map((lk) => (
                      <a key={lk} href="#top" style={{ fontSize: 13.5, color: '#A8B3C2', textDecoration: 'none' }}>{lk}</a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', paddingTop: 22, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
              <div style={{ fontSize: 13, color: '#6b7686' }}>© 2026 GWL Creators Hub. All rights reserved.</div>
              <a href="#top" style={{ fontSize: 13, fontWeight: 600, color: '#A8B3C2', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>↑ Back to top</a>
            </div>
          </div>
        </footer>

        {/* FLOATING WIDGETS */}
        <div className="floatcol" style={{ position: 'fixed', right: 22, top: '50%', transform: 'translateY(-50%)', zIndex: 55, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button onClick={() => setFaqOpen(true)} title="FAQ" style={{ cursor: 'pointer', width: 54, height: 54, borderRadius: 16, background: 'rgba(18,24,33,.85)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,.14)', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, boxShadow: '0 10px 28px -8px rgba(0,0,0,.6)' }}>
            <span style={{ fontSize: 18 }}>💬</span><span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.03em' }}>FAQ</span>
          </button>
          <button onClick={() => { setContactOpen(true); setContactSent(false); }} title="Contact" style={{ cursor: 'pointer', width: 54, height: 54, borderRadius: 16, background: 'linear-gradient(135deg,#2A96A6,#36b6c9)', border: 'none', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, boxShadow: '0 10px 28px -8px rgba(42,150,166,.6)' }}>
            <span style={{ fontSize: 18 }}>✉️</span><span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.03em' }}>Help</span>
          </button>
        </div>

        {/* FAQ DRAWER */}
        {faqOpen && (
          <div onClick={() => setFaqOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(3px)', animation: 'fadeIn .25s' }}>
            <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 440, maxWidth: '92vw', background: '#0d131a', borderLeft: '1px solid rgba(255,255,255,.1)', animation: 'slideOver .32s cubic-bezier(.16,1,.3,1)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '22px 24px', borderBottom: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 20 }}>Help Center</div>
                  <div style={{ fontSize: 13, color: '#A8B3C2' }}>Find answers in seconds</div>
                </div>
                <button onClick={() => setFaqOpen(false)} style={{ cursor: 'pointer', width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', color: '#fff', fontSize: 18 }}>✕</button>
              </div>
              <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 12, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)' }}>
                  <span style={{ color: '#6b7686' }}>🔍</span>
                  <input value={faqSearch} onChange={(e) => setFaqSearch(e.target.value)} placeholder="Search help articles..." style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#fff', fontFamily: '"Plus Jakarta Sans"', fontSize: 14 }} />
                </div>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '18px 24px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
                  {['Products', 'Membership', 'Payments', 'Downloads', 'License'].map((fc) => (
                    <span key={fc} style={{ padding: '6px 12px', borderRadius: 999, background: 'rgba(42,150,166,.12)', border: '1px solid rgba(42,150,166,.25)', fontSize: 12, fontWeight: 600, color: '#36b6c9' }}>{fc}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {drawerData.filter((d) => !faqSearch || (d.q + d.a).toLowerCase().includes(faqSearch.toLowerCase())).map((df, i) => (
                    <div key={df.q} style={{ borderRadius: 12, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', overflow: 'hidden' }}>
                      <button onClick={() => setOpenDrawerIdx((x) => (x === i ? -1 : i))} style={{ cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '15px 16px', background: 'none', border: 'none', textAlign: 'left' }}>
                        <span style={{ fontWeight: 600, fontSize: 14.5, color: '#fff' }}>{df.q}</span>
                        <span style={{ color: '#2A96A6', fontSize: 18, transform: openDrawerIdx === i ? 'rotate(45deg)' : 'rotate(0deg)', transition: 'transform .2s' }}>+</span>
                      </button>
                      <div style={{ maxHeight: openDrawerIdx === i ? 300 : 0, overflow: 'hidden', transition: 'max-height .3s' }}>
                        <div style={{ padding: '0 16px 16px', fontSize: 13.5, lineHeight: 1.6, color: '#A8B3C2' }}>{df.a}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ padding: '18px 24px', borderTop: '1px solid rgba(255,255,255,.08)' }}>
                <div style={{ fontSize: 13, color: '#A8B3C2', marginBottom: 10 }}>Still need help?</div>
                <button onClick={() => { setFaqOpen(false); setContactOpen(true); setContactSent(false); }} style={{ cursor: 'pointer', width: '100%', fontFamily: 'Sora', fontWeight: 700, fontSize: 14, color: '#fff', background: 'linear-gradient(95deg,#2A96A6,#36b6c9)', border: 'none', borderRadius: 12, padding: 13 }}>Contact Support</button>
              </div>
            </div>
          </div>
        )}

        {/* CONTACT MODAL */}
        {contactOpen && (
          <div onClick={() => setContactOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 85, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, animation: 'fadeIn .25s' }}>
            <div onClick={(e) => e.stopPropagation()} style={{ width: 460, maxWidth: '100%', background: '#0d131a', border: '1px solid rgba(255,255,255,.12)', borderRadius: 22, overflow: 'hidden', animation: 'scaleIn .3s cubic-bezier(.16,1,.3,1)' }}>
              <div style={{ padding: 24, borderBottom: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 20 }}>Get in touch</div>
                  <div style={{ fontSize: 13, color: '#00C853' }}>● Typically replies within 2 hours</div>
                </div>
                <button onClick={() => setContactOpen(false)} style={{ cursor: 'pointer', width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', color: '#fff', fontSize: 18 }}>✕</button>
              </div>
              <div style={{ padding: 24 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
                  {[{ icon: '💬', label: 'WhatsApp', sub: 'Chat with us' }, { icon: '✉️', label: 'Email', sub: 'hi@gwlhub.com' }].map((cc) => (
                    <a key={cc.label} href="#top" style={{ display: 'flex', alignItems: 'center', gap: 11, padding: 14, borderRadius: 13, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', textDecoration: 'none' }}>
                      <span style={{ fontSize: 20 }}>{cc.icon}</span>
                      <div><div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{cc.label}</div><div style={{ fontSize: 11, color: '#A8B3C2' }}>{cc.sub}</div></div>
                    </a>
                  ))}
                </div>
                {contactSent ? (
                  <div style={{ textAlign: 'center', padding: '24px 0' }}>
                    <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
                    <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 18, marginBottom: 6 }}>Message sent!</div>
                    <div style={{ fontSize: 14, color: '#A8B3C2' }}>We'll get back to you shortly.</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                    <input placeholder="Your name" style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 11, padding: '13px 15px', color: '#fff', fontFamily: '"Plus Jakarta Sans"', fontSize: 14, outline: 'none' }} />
                    <input placeholder="Email address" style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 11, padding: '13px 15px', color: '#fff', fontFamily: '"Plus Jakarta Sans"', fontSize: 14, outline: 'none' }} />
                    <textarea placeholder="How can we help?" rows={3} style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 11, padding: '13px 15px', color: '#fff', fontFamily: '"Plus Jakarta Sans"', fontSize: 14, outline: 'none', resize: 'none' }} />
                    <button onClick={() => setContactSent(true)} style={{ cursor: 'pointer', fontFamily: 'Sora', fontWeight: 700, fontSize: 15, color: '#06222a', background: 'linear-gradient(95deg,#2A96A6,#36b6c9)', border: 'none', borderRadius: 12, padding: 14, marginTop: 4 }}>Send message</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PURCHASE FLOW MODAL */}
        {buyOpen && (
          <div onClick={() => setBuyOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, animation: 'fadeIn .25s' }}>
            <div onClick={(e) => e.stopPropagation()} style={{ width: 480, maxWidth: '100%', background: '#0d131a', border: '1px solid rgba(255,255,255,.12)', borderRadius: 24, overflow: 'hidden', animation: 'scaleIn .3s cubic-bezier(.16,1,.3,1)' }}>
              <div style={{ display: 'flex', height: 4 }}>
                <div style={{ flex: 1, background: buyStep >= 1 ? '#2A96A6' : 'rgba(255,255,255,.1)' }} />
                <div style={{ flex: 1, background: buyStep >= 2 ? '#2A96A6' : 'rgba(255,255,255,.1)' }} />
                <div style={{ flex: 1, background: buyStep >= 3 ? '#00C853' : 'rgba(255,255,255,.1)' }} />
              </div>

              {buyStep === 1 && (
                <div style={{ padding: 26 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#2A96A6', letterSpacing: '.08em' }}>STEP 1 OF 3 · REVIEW</span>
                    <button onClick={() => setBuyOpen(false)} style={{ cursor: 'pointer', width: 32, height: 32, borderRadius: 9, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', color: '#fff', fontSize: 16 }}>✕</button>
                  </div>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center', padding: 16, borderRadius: 14, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', marginBottom: 20 }}>
                    <div style={{ width: 56, height: 56, borderRadius: 12, background: 'rgba(42,150,166,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>{item.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 17 }}>{item.name}</div>
                      <div style={{ fontSize: 13, color: '#A8B3C2' }}>{item.desc}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#A8B3C2' }}><span>Original price</span><span style={{ textDecoration: 'line-through' }}>{item.original}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}><span style={{ color: '#A8B3C2' }}>Today's offer</span><span style={{ fontWeight: 700, color: '#fff' }}>{item.offer}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}><span style={{ color: '#F4C542' }}>👑 Member price</span><span style={{ fontWeight: 700, color: '#F4C542' }}>{item.member}</span></div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 12, background: 'rgba(0,200,83,.08)', border: '1px solid rgba(0,200,83,.2)', marginBottom: 20 }}>
                    <span style={{ fontSize: 16 }}>💡</span>
                    <span style={{ fontSize: 13, color: '#7Cffb0' }}>Become a member at checkout and pay just <b>{item.member}</b></span>
                  </div>
                  <button onClick={goPay} style={{ cursor: 'pointer', width: '100%', fontFamily: 'Sora', fontWeight: 700, fontSize: 16, color: '#06222a', background: 'linear-gradient(95deg,#F4C542,#D4A017)', border: 'none', borderRadius: 13, padding: 15, marginBottom: 10 }}>Continue to payment →</button>
                  <div style={{ textAlign: 'center', fontSize: 12, color: '#6b7686' }}>🔒 No account required · Secure external checkout</div>
                </div>
              )}

              {buyStep === 2 && (
                <div style={{ padding: '50px 26px', textAlign: 'center' }}>
                  <div style={{ width: 60, height: 60, margin: '0 auto 22px', borderRadius: '50%', border: '4px solid rgba(42,150,166,.2)', borderTopColor: '#2A96A6', animation: 'spin .9s linear infinite' }} />
                  <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 19, marginBottom: 8 }}>Redirecting to secure payment…</div>
                  <div style={{ fontSize: 14, color: '#A8B3C2' }}>Powered by external payment gateway</div>
                </div>
              )}

              {buyStep === 3 && (
                <div style={{ padding: 26, textAlign: 'center' }}>
                  <div style={{ width: 68, height: 68, margin: '6px auto 18px', borderRadius: '50%', background: 'rgba(0,200,83,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34 }}>✅</div>
                  <div style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 24, marginBottom: 8 }}>Payment successful!</div>
                  <div style={{ fontSize: 14, color: '#A8B3C2', marginBottom: 24 }}>Your download for <b style={{ color: '#fff' }}>{item.name}</b> is ready. Check your email.</div>
                  <div style={{ textAlign: 'left', borderRadius: 18, background: 'linear-gradient(135deg,rgba(244,197,66,.12),rgba(42,150,166,.06))', border: '1px solid rgba(244,197,66,.3)', padding: 22, marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <span style={{ fontSize: 18 }}>👑</span>
                      <span style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 16 }}>Unlock lifetime member savings</span>
                    </div>
                    <div style={{ fontSize: 13.5, color: '#A8B3C2', lineHeight: 1.55, marginBottom: 16 }}>Add lifetime membership for just <b style={{ color: '#F4C542' }}>₹39</b> and get member pricing, bonus drops, and early access on everything — forever.</div>
                    <button onClick={openMembership} style={{ cursor: 'pointer', width: '100%', fontFamily: 'Sora', fontWeight: 700, fontSize: 15, color: '#06222a', background: 'linear-gradient(95deg,#F4C542,#D4A017)', border: 'none', borderRadius: 12, padding: 14 }}>Add membership for ₹39</button>
                  </div>
                  <button onClick={() => setBuyOpen(false)} style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#A8B3C2', fontSize: 14, fontWeight: 600, fontFamily: '"Plus Jakarta Sans"' }}>Continue browsing →</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TOAST */}
        {toast && (
          <div style={{ position: 'fixed', bottom: 26, left: '50%', transform: 'translateX(-50%)', zIndex: 95, background: '#1A2430', border: '1px solid rgba(255,255,255,.14)', borderRadius: 13, padding: '14px 22px', display: 'flex', alignItems: 'center', gap: 11, boxShadow: '0 16px 40px -10px rgba(0,0,0,.7)', animation: 'scaleIn .3s' }}>
            <span style={{ fontSize: 18 }}>{toastIcon}</span>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{toast}</span>
          </div>
        )}
      </div>

      <style>{`
        html{scroll-behavior:smooth}
        .nav-signin:hover{background:rgba(255,255,255,.12)!important}
        .why-card:hover{background:rgba(255,255,255,.07)!important;transform:translateY(-4px);border-color:rgba(42,150,166,.4)!important}
        .prod-card:hover{transform:translateY(-5px);border-color:rgba(42,150,166,.45)!important;box-shadow:0 26px 50px -18px rgba(0,0,0,.7)}
        .bundle-row:hover{border-color:rgba(244,197,66,.4)!important;transform:translateY(-2px)}
        @media(min-width:1024px){.livechip{display:flex!important}}
        @media(max-width:1080px){
          .mainwrap{grid-template-columns:1fr!important}
          .sidebar{position:static!important;flex-direction:row!important;flex-wrap:wrap!important}
          .sidebar>div{flex:1;min-width:240px}
        }
        @media(max-width:900px){
          .herogrid{grid-template-columns:1fr!important;gap:32px!important;padding-top:120px!important}
          .herovisual{min-height:380px!important}
          .why4{grid-template-columns:repeat(2,1fr)!important}
          .prodgrid{grid-template-columns:1fr!important}
          .showgrid{grid-template-columns:1fr!important}
          .showgrid>div{order:0!important}
          .memgrid{grid-template-columns:1fr!important}
          .statsgrid,.trust4{grid-template-columns:repeat(2,1fr)!important;row-gap:28px!important}
          .footgrid{grid-template-columns:1fr 1fr!important}
          .floatcol{top:auto!important;bottom:22px!important;transform:none!important}
          h1{font-size:46px!important}
        }
        @media(max-width:560px){
          .why4{grid-template-columns:1fr!important}
          .bundlerow{grid-template-columns:1fr!important;text-align:center;gap:14px!important;justify-items:center}
          .bundlerow>div:last-child{align-items:center!important}
          .footgrid{grid-template-columns:1fr!important}
          h1{font-size:38px!important}
        }
      `}</style>
    </>
  );
}
