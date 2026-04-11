import { useState, useEffect } from 'react';
import {
  Activity, Bell, BookOpen, Calculator, Users, BookMarked,
  ChevronRight, ChevronDown, ChevronUp, ExternalLink,
  ArrowRight, CheckCircle, Clock, Mail, Phone,
  BarChart2, FileText, Lightbulb, Microscope, Star,
  GraduationCap, Award, Search, X, Menu, Lock,
  Send, Layers, AlertCircle, Calculator as CalcIcon,
  Percent, Target, FlaskConical, ArrowUpRight,
  BarChart3, TrendingUp, FolderOpen
} from 'lucide-react';
import { validateURSCredentials, getURSClients, getDashboardData, updateClientStatus, getAnnouncements, getLiveUpdates, getResources, OFFICER_PASSWORD } from './api';

// ============================================================================
// TYPES
// ============================================================================
interface Announcement {
  id: number;
  type: 'Workshop' | 'Methodology Minute' | 'Advisory';
  badge: string;
  badgeColor: 'gold' | 'teal' | 'green' | 'navy';
  date: string;
  title: string;
  body: string;
  link?: string;
}

interface Resource {
  id: number;
  category: string;
  title: string;
  description: string;
  link: string;
  tags: string[];
}

interface Personnel {
  role: string;
  name: string;
  description: string;
  responsibilities: string[];
  icon: string;
}

interface LiveUpdate {
  id: number;
  title: string;
  description: string;
  link: string;
  date: string;
  category: 'Trends' | 'Guidelines' | 'Tools' | 'Publications';
}

// ============================================================================
// DATA - Default content (used as fallback if API fails)
// ============================================================================
const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 1,
    type: 'Workshop',
    badge: 'Upcoming',
    badgeColor: 'gold',
    date: 'April 15, 2026',
    title: 'Research Designs and the Choice of Appropriate Statistical Tools',
    body: 'A capability-building workshop for SLU faculty and graduate students. Topics include experimental design, sampling frameworks, and statistical test selection.',
    link: '#',
  },
  {
    id: 2,
    type: 'Methodology Minute',
    badge: 'New',
    badgeColor: 'teal',
    date: 'March 28, 2026',
    title: 'When to Use Cronbach\'s Alpha vs. McDonald\'s Omega',
    body: 'Alpha assumes tau-equivalence—when items vary in factor loadings, omega total is the more defensible reliability estimate. ISRM now recommends reporting both in submitted manuscripts.',
    link: '#',
  },
  {
    id: 3,
    type: 'Advisory',
    badge: 'Notice',
    badgeColor: 'navy',
    date: 'March 10, 2026',
    title: 'New Online Payment Option for Statistical Services',
    body: 'Clients may now settle consultation fees via GCash or bank transfer before their scheduled session. Submit your official receipt or payment screenshot to the ISM Officer.',
    link: '#',
  },
];

const DEFAULT_LIVE_UPDATES: LiveUpdate[] = [
  {
    id: 1,
    title: 'APA 7th Edition Statistics Reporting Guide',
    description: 'Quick-reference for reporting descriptive stats, t-tests, ANOVA, regression, and correlation in APA 7 format with exact table templates.',
    link: 'https://apastyle.apa.org/instructional-aids/numbers-statistics-guide.pdf',
    date: '2026-03-15',
    category: 'Guidelines',
  },
  {
    id: 2,
    title: 'jamovi - Free Statistical Software',
    description: 'Point-and-click interface over R engine. Ideal for ANOVA, regression, factor analysis, and reliability testing without scripting.',
    link: 'https://www.jamovi.org',
    date: '2026-03-10',
    category: 'Tools',
  },
  {
    id: 3,
    title: 'G*Power - Sample Size & Power Analysis',
    description: 'Determine minimum sample sizes for t-tests, ANOVA, chi-square, regression, and more. Free desktop application.',
    link: 'https://www.psychologie.hhu.de/arbeitsgruppen/allgemeine-psychologie-und-arbeitspsychologie/gpower',
    date: '2026-03-05',
    category: 'Tools',
  },
  {
    id: 4,
    title: 'Effect Size Interpretation Guide',
    description: 'Standardized benchmarks for Cohen\'s d, η², ω², f, r, and Cramer\'s V across social science, education, and health research contexts.',
    link: '#',
    date: '2026-02-28',
    category: 'Guidelines',
  },
  {
    id: 5,
    title: 'Aiken\'s V Calculator Template',
    description: 'Excel-based template for computing Aiken\'s V, I-CVI, S-CVI/Ave, and modified kappa from expert panel ratings.',
    link: '#',
    date: '2026-02-20',
    category: 'Tools',
  },
  {
    id: 6,
    title: 'Mixed-Methods Design Framework',
    description: 'Creswell\'s typology of convergent, explanatory-sequential, and exploratory-sequential designs with integration strategies.',
    link: 'https://us.sagepub.com/en-us/nam/designing-and-conducting-mixed-methods-research/book241842',
    date: '2026-02-15',
    category: 'Publications',
  },
];

const RESOURCES: Resource[] = [
  {
    id: 1,
    category: 'Statistical Tools',
    title: 'jamovi — Free Statistical Software',
    description: 'Point-and-click interface over R engine. Ideal for ANOVA, regression, factor analysis, and reliability testing without scripting.',
    link: 'https://www.jamovi.org',
    tags: ['ANOVA', 'Regression', 'EFA'],
  },
  {
    id: 2,
    category: 'Statistical Tools',
    title: 'G*Power — Sample Size & Power Analysis',
    description: 'Determine minimum sample sizes for t-tests, ANOVA, chi-square, regression, and more. Free desktop application.',
    link: 'https://www.psychologie.hhu.de/arbeitsgruppen/allgemeine-psychologie-und-arbeitspsychologie/gpower',
    tags: ['Power Analysis', 'Sample Size'],
  },
  {
    id: 3,
    category: 'Validity & Reliability',
    title: 'Aiken\'s V Calculator (ISRM Template)',
    description: 'Excel-based template for computing Aiken\'s V, I-CVI, S-CVI/Ave, and modified kappa from expert panel ratings.',
    link: '#',
    tags: ['Content Validity', 'CVI', 'Kappa'],
  },
  {
    id: 4,
    category: 'Validity & Reliability',
    title: 'Scale Reliability — McDonald\'s Omega',
    description: 'Guide to computing omega total and omega hierarchical in R/jamovi as a more defensible alternative to Cronbach\'s alpha.',
    link: 'https://www.tandfonline.com/doi/full/10.1080/00220973.2019.1635153',
    tags: ['Reliability', 'Omega', 'Alpha'],
  },
  {
    id: 5,
    category: 'Sampling',
    title: 'Raosoft Sample Size Estimator',
    description: 'Online calculator for survey sample sizes. Input population size, margin of error, confidence level, and response distribution.',
    link: 'http://www.raosoft.com/samplesize.html',
    tags: ['Sample Size', 'Survey'],
  },
  {
    id: 6,
    category: 'Writing',
    title: 'APA 7th Edition — Statistics Reporting',
    description: 'Quick-reference guide for reporting descriptive stats, t-tests, ANOVA, regression, and correlation in APA 7 format with exact table templates.',
    link: 'https://apastyle.apa.org/instructional-aids/numbers-statistics-guide.pdf',
    tags: ['APA 7', 'Results'],
  },
];

const PERSONNEL: Personnel[] = [
  {
    role: 'ISM Officer',
    name: 'Harold O. Lagto',
    description: 'Oversees all Research Statistical Services operations, designs training modules, assigns tasks to University Research Statisticians, and ensures client satisfaction across all engagements.',
    responsibilities: [
      'Design and conduct statistical training workshops',
      'Assign and monitor University Research Statisticians',
      'Assist faculty grantees in research design and statistical methods',
      'Prepare and submit the RSS Yearly Report to the RISE Center Director',
      'Review and improve RSS guidelines and procedures',
    ],
    icon: 'Award',
  },
  {
    role: 'University Research Statistician',
    name: 'Pool of URS',
    description: 'Faculty or staff members qualified in statistical methods who provide consultation and full-assistance services on an on-call basis. Entitled to 60% of client fees for services rendered.',
    responsibilities: [
      'Conduct consultancy sessions (individual or group)',
      'Provide full statistical assistance from analysis to defense',
      'Facilitate or assist in seminars and workshops',
      'Report all services to ISM Officer for monitoring',
      'Refrain from unsanctioned consultations on campus',
    ],
    icon: 'GraduationCap',
  },
];

const FEE_TABLE = {
  'SLU Undergraduate': {
    consultation: { rate: 200, unit: 'per hour' },
    fullAssistance: { rate: 2000, unit: 'per study' },
  },
  'SLU Graduate / Staff': {
    consultation: { rate: 300, unit: 'per hour' },
    fullAssistance: { rate: 4500, unit: 'per study' },
  },
  'Non-SLU (Undergraduate)': {
    consultation: { rate: 220, unit: 'per hour' },
    fullAssistance: { rate: 2200, unit: 'per study' },
  },
  'Non-SLU (Graduate)': {
    consultation: { rate: 350, unit: 'per hour' },
    fullAssistance: { rate: 5000, unit: 'per study' },
  },
};

// ============================================================================
// CONSTANTS
// ============================================================================
const T = {
  navy: '#0f2557',
  navyD: '#071435',
  navyL: '#1a3d7c',
  gold: '#C9A84C',
  goldL: '#e0c36c',
  bg: '#f8f9fc',
  white: '#ffffff',
  text: '#1e293b',
  muted: '#64748b',
  border: '#e2e8f0',
};

// ============================================================================
// HELPER COMPONENTS
// ============================================================================
function Card({ children, className = '', style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all ${className}`} style={style}>
      {children}
    </div>
  );
}

function Badge({ children, variant = 'navy' }: { children: React.ReactNode; variant?: 'gold' | 'teal' | 'green' | 'navy' }) {
  const colors = {
    gold: 'bg-amber-100 text-amber-800 border-amber-300',
    teal: 'bg-teal-100 text-teal-800 border-teal-300',
    green: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    navy: 'bg-blue-100 text-blue-900 border-blue-300',
  };
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${colors[variant]}`}>
      {children}
    </span>
  );
}

function IconMap({ name, size = 20, className = '' }: { name: string; size?: number; className?: string }) {
  const icons: Record<string, React.ReactNode> = {
    BarChart: <BarChart2 size={size} className={className} />,
    Award: <Award size={size} className={className} />,
    GraduationCap: <GraduationCap size={size} className={className} />,
    FileText: <FileText size={size} className={className} />,
    Lightbulb: <Lightbulb size={size} className={className} />,
    Activity: <Activity size={size} className={className} />,
    Calculator: <Calculator size={size} className={className} />,
    Layers: <Layers size={size} className={className} />,
  };
  return <>{icons[name] || <Star size={size} className={className} />}</>;
}

// ============================================================================
// NAVIGATION
// ============================================================================
function Navbar({ currentPage, setPage }: { currentPage: string; setPage: (page: string) => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'updates', label: 'Live Updates' },
    { id: 'resources', label: 'Resources' },
    { id: 'services', label: 'Services' },
    { id: 'personnel', label: 'Personnel' },
    { id: 'dashboard', label: 'Officer Portal', private: true },
    { id: 'urs-portal', label: 'URS Portal', private: true },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-navy shadow-xl' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <button onClick={() => setPage('home')} className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-full bg-gold flex items-center justify-center shadow-md">
            <Activity size={18} className="text-navy" />
          </div>
          <div className="leading-tight">
            <div className="text-white text-sm font-bold tracking-widest uppercase">ISRM · RISE</div>
            <div className="text-gold text-[10px] tracking-widest uppercase">Saint Louis University</div>
          </div>
        </button>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => (
            <button
              key={l.id}
              onClick={() => setPage(l.id)}
              className={`px-3 py-2 text-[13px] rounded transition-all ${
                currentPage === l.id
                  ? 'text-gold font-semibold'
                  : 'text-blue-200 hover:text-white hover:bg-white/10'
              }`}
            >
              {l.label}
              {l.private && <Lock size={10} className="inline ml-1 opacity-70" />}
            </button>
          ))}
          <button
            onClick={() => setPage('services')}
            className="ml-3 px-4 py-2 bg-gold text-navy text-[13px] font-bold rounded hover:bg-amber-400 transition-all"
          >
            Request Service
          </button>
        </div>

        <button className="md:hidden text-white" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-navy border-t border-white/10 px-6 pb-5 pt-2 flex flex-col gap-2">
          {navLinks.map((l) => (
            <button
              key={l.id}
              onClick={() => { setPage(l.id); setMenuOpen(false); }}
              className="py-2 text-blue-200 text-sm border-b border-white/10 text-left"
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}

// ============================================================================
// HOME PAGE
// ============================================================================
function HomePage({ setPage, announcements = DEFAULT_ANNOUNCEMENTS, liveUpdates = DEFAULT_LIVE_UPDATES }: { setPage: (page: string) => void; announcements?: any[]; liveUpdates?: any[] }) {
  const displayAnnouncements = announcements.length > 0 ? announcements : DEFAULT_ANNOUNCEMENTS;
  const displayLiveUpdates = liveUpdates.length > 0 ? liveUpdates : DEFAULT_LIVE_UPDATES;
  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #071435 0%, #0f2557 55%, #1a3d7c 100%)' }}>
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 39px,#C9A84C 39px,#C9A84C 40px), repeating-linear-gradient(90deg,transparent,transparent 79px,#C9A84C 79px,#C9A84C 80px)',
        }} />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />

        <div className="relative max-w-7xl mx-auto px-6 py-32 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gold/15 border border-gold/30 rounded-full mb-7">
              <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
              <span className="text-gold text-xs tracking-widest uppercase font-semibold">RISE Center · ISRM Unit</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-white leading-[1.1] mb-6 font-playfair">
              Research<br /><span className="text-gold">Statistical</span><br />Services
            </h1>

            <div className="w-16 h-0.5 bg-gold mb-6" />

            <p className="text-blue-200 text-lg leading-relaxed mb-10 max-w-lg">
              Expert statistical consultation, full-study assistance, and capability-building workshops—available to all SLU researchers, faculty, and graduate students at Saint Louis University, Baguio City.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setPage('services')}
                className="flex items-center gap-2 px-6 py-3 bg-gold text-navy font-bold rounded-lg hover:bg-amber-400 transition-all shadow-lg"
              >
                Request a Service <ArrowRight size={16} />
              </button>
              <button
                onClick={() => setPage('resources')}
                className="flex items-center gap-2 px-6 py-3 border border-white/25 text-white rounded-lg hover:bg-white/10 transition-all"
              >
                View Resources <Calculator size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Users, label: 'Faculty & Students', value: '500+', sub: 'per academic year' },
              { icon: BookOpen, label: 'Training Workshops', value: '12+', sub: 'themes available' },
              { icon: Clock, label: 'Consultation', value: '₱300', sub: 'per hour (grad/staff)' },
              { icon: Star, label: 'Client Satisfaction', value: 'Highly', sub: 'rated by researchers' },
            ].map((s) => (
              <div key={s.label} className="p-5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all">
                <div className="w-10 h-10 rounded-lg bg-gold/15 border border-gold/25 flex items-center justify-center mb-3">
                  <s.icon size={18} className="text-gold" />
                </div>
                <div className="text-2xl font-bold text-white font-playfair">{s.value}</div>
                <div className="text-blue-200 text-xs leading-snug">{s.label}</div>
                <div className="text-blue-400 text-[11px] mt-1">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none"><path d="M0 60 L0 30 Q360 0 720 30 Q1080 60 1440 30 L1440 60 Z" fill="#f8f9fc" /></svg>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-navy font-playfair text-center mb-12">Explore Our Services</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Bell, title: 'Live Updates', desc: 'Latest trends, guidelines, and tools in research methodology', page: 'updates', color: 'bg-amber-100' },
              { icon: BookMarked, title: 'Resources', desc: 'Sample size calculators, validity tools, and reference guides', page: 'resources', color: 'bg-teal-100' },
              { icon: Calculator, title: 'Fee Calculator', desc: 'Interactive tool to estimate service costs', page: 'services', color: 'bg-blue-100' },
              { icon: Users, title: 'Personnel', desc: 'Meet the ISM Officer and University Research Statisticians', page: 'personnel', color: 'bg-emerald-100' },
            ].map((item) => (
              <button
                key={item.title}
                onClick={() => setPage(item.page)}
                className="text-left p-6 bg-white rounded-xl border border-slate-200 hover:border-gold hover:shadow-xl transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-4`}>
                  <item.icon size={24} className="text-navy" />
                </div>
                <h3 className="text-lg font-bold text-navy font-playfair mb-2 group-hover:text-gold transition-colors">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Announcements */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy font-playfair mb-3">Latest Announcements</h2>
            <p className="text-slate-500 max-w-lg mx-auto">Stay informed about workshops, methodology tips, and unit advisories.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {displayAnnouncements.slice(0, 3).map((ann) => (
              <Card key={ann.id} className="overflow-hidden">
                <div className="h-1 bg-gold" />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant={ann.badgeColor}>{ann.badge}</Badge>
                    <span className="text-slate-400 text-[11px]">{ann.date}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 uppercase tracking-widest mb-1.5">{ann.type}</div>
                  <h3 className="text-[15px] font-bold text-navy leading-snug mb-3 font-playfair">{ann.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">{ann.body}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ============================================================================
// LIVE UPDATES PAGE
// ============================================================================
function LiveUpdatesPage({ liveUpdates = [] }: { liveUpdates?: any[] }) {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const categories = ['All', 'Trends', 'Guidelines', 'Tools', 'Publications'];
  const displayLiveUpdates = liveUpdates.length > 0 ? liveUpdates : DEFAULT_LIVE_UPDATES;

  const filtered = displayLiveUpdates.filter(u => {
    const matchCat = filter === 'All' || u.category === filter;
    const matchSearch = !search || u.title.toLowerCase().includes(search.toLowerCase()) || u.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="pt-24 pb-16 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Bell size={16} className="text-gold" />
            <span className="text-gold text-xs tracking-widest uppercase font-semibold">Stay Informed</span>
          </div>
          <h1 className="text-4xl font-bold text-navy font-playfair mb-3">Live Updates</h1>
          <p className="text-slate-500 max-w-lg mx-auto">Latest trends, guidelines, tools, and publications in research methodology. Updated regularly by the ISRM Unit.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-10 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search updates..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-navy"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${filter === c ? 'bg-navy text-white border-navy' : 'bg-white text-slate-600 border-slate-200 hover:border-navy'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Updates Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((update) => (
            <Card key={update.id} className="p-6 hover:border-gold transition-all group">
              <div className="flex items-center justify-between mb-4">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                  update.category === 'Trends' ? 'bg-amber-100 text-amber-800' :
                  update.category === 'Guidelines' ? 'bg-blue-100 text-blue-800' :
                  update.category === 'Tools' ? 'bg-teal-100 text-teal-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {update.category}
                </span>
                <span className="text-slate-400 text-[11px]">{update.date}</span>
              </div>
              <h3 className="text-[15px] font-bold text-navy leading-snug mb-2 font-playfair group-hover:text-gold transition-colors">{update.title}</h3>
              <p className="text-slate-500 text-[13px] leading-relaxed mb-4 line-clamp-3">{update.description}</p>
              <a
                href={update.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-navy text-sm font-semibold group-hover:text-gold transition-colors"
              >
                Open Link <ExternalLink size={13} />
              </a>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <Search size={32} className="mx-auto mb-3 opacity-40" />
            <p>No updates match your search. Try a different term or category.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// SAMPLE SIZE CALCULATOR COMPONENT
// ============================================================================
function SampleSizeCalculator() {
  const [calcType, setCalcType] = useState<'power' | 'proportion' | 'cochran-prop' | 'cochran-mean'>('power');
  const [result, setResult] = useState<number | null>(null);
  const [resultLabel, setResultLabel] = useState<string>('Required Sample Size');

  // Power analysis inputs
  const [effectSize, setEffectSize] = useState(0.5);
  const [alpha, setAlpha] = useState(0.05);
  const [power, setPower] = useState(0.8);
  const [testType, setTestType] = useState('t-test');

  // Proportion inputs
  const [p1, setP1] = useState(0.5);
  const [p2, setP2] = useState(0.3);
  const [margin, setMargin] = useState(0.05);

  // Cochran's Formula inputs (proportions)
  const [confLevel, setConfLevel] = useState(0.95);
  const [estProp, setEstProp] = useState(0.5);
  const [cochranMargin, setCochranMargin] = useState(0.05);
  const [population, setPopulation] = useState<number | null>(null);

  // Cochran's Formula inputs (means)
  const [stdDev, setStdDev] = useState(10);
  const [meanMargin, setMeanMargin] = useState(2);

  const getZScore = (confidence: number) => {
    const zTable: Record<number, number> = {
      0.90: 1.645,
      0.95: 1.96,
      0.99: 2.576
    };
    return zTable[confidence] || 1.96;
  };

  const calculatePower = () => {
    const zAlphaVal = alpha === 0.01 ? 2.576 : alpha === 0.05 ? 1.96 : 1.645;
    const zBetaVal = power === 0.5 ? 0 : power === 0.6 ? 0.253 : power === 0.7 ? 0.524 : power === 0.8 ? 0.842 : power === 0.9 ? 1.282 : 0.842;
    const d = effectSize;
    
    if (testType === 't-test') {
      const n = 2 * Math.pow((zAlphaVal + zBetaVal) / d, 2);
      setResult(Math.ceil(n));
      setResultLabel('Required Sample Size (per group)');
    } else if (testType === 'anova') {
      const n = 2 * Math.pow((zAlphaVal + zBetaVal) / d, 2) * 1.5;
      setResult(Math.ceil(n));
      setResultLabel('Required Sample Size (per group)');
    } else {
      const n = Math.pow((zAlphaVal + zBetaVal) / d, 2);
      setResult(Math.ceil(n));
      setResultLabel('Required Sample Size');
    }
  };

  const calculateProportion = () => {
    const z = 1.96;
    const pAvg = (p1 + p2) / 2;
    const n = (z * z * 2 * pAvg * (1 - pAvg)) / Math.pow(p1 - p2, 2);
    setResult(Math.ceil(n));
    setResultLabel('Required Sample Size (per group)');
  };

  const calculateCochranProportion = () => {
    const z = getZScore(confLevel);
    const e = cochranMargin;
    const p = estProp;
    
    const n0 = (z * z * p * (1 - p)) / (e * e);
    
    let n = n0;
    if (population && population > 0) {
      n = n0 / (1 + (n0 - 1) / population);
    }
    
    setResult(Math.ceil(n));
    setResultLabel('Required Sample Size');
  };

  const calculateCochranMean = () => {
    const z = getZScore(confLevel);
    const e = meanMargin;
    const sigma = stdDev;
    
    const n0 = (z * z * sigma * sigma) / (e * e);
    
    let n = n0;
    if (population && population > 0) {
      n = n0 / (1 + (n0 - 1) / population);
    }
    
    setResult(Math.ceil(n));
    setResultLabel('Required Sample Size');
  };

  const handleCalcTypeChange = (type: 'power' | 'proportion' | 'cochran-prop' | 'cochran-mean') => {
    setCalcType(type);
    setResult(null);
  };

  const calcButton = (type: 'power' | 'proportion' | 'cochran-prop' | 'cochran-mean', label: string, icon: React.ReactNode) => (
    <button
      onClick={() => handleCalcTypeChange(type)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${calcType === type ? 'bg-navy text-white' : 'bg-slate-100 text-slate-600'}`}
    >
      {icon} {label}
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 mb-4">
        {calcButton('power', 'By Effect Size/Power', <Target size={16} />)}
        {calcButton('proportion', 'By Proportions', <Percent size={16} />)}
        {calcButton('cochran-prop', "Cochran's (Proportions)", <BarChart3 size={16} />)}
        {calcButton('cochran-mean', "Cochran's (Means)", <TrendingUp size={16} />)}
      </div>

      {calcType === 'power' && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Test Type</label>
            <select
              value={testType}
              onChange={(e) => setTestType(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm"
            >
              <option value="t-test">Independent t-test</option>
              <option value="anova">One-way ANOVA</option>
              <option value="correlation">Correlation</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
              Effect Size (d): <span className="text-navy">{effectSize}</span>
              <span className="text-slate-400 font-normal ml-2">
                ({effectSize < 0.2 ? 'Small' : effectSize < 0.5 ? 'Medium' : 'Large'})
              </span>
            </label>
            <input
              type="range"
              min={0.1}
              max={1.5}
              step={0.1}
              value={effectSize}
              onChange={(e) => setEffectSize(Number(e.target.value))}
              className="w-full accent-gold"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>0.2 (Small)</span><span>0.5 (Medium)</span><span>1.5 (Large)</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
              Alpha (α): <span className="text-navy">{alpha}</span>
            </label>
            <input
              type="range"
              min={0.01}
              max={0.1}
              step={0.01}
              value={alpha}
              onChange={(e) => setAlpha(Number(e.target.value))}
              className="w-full accent-gold"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
              Statistical Power (1-β): <span className="text-navy">{power}</span>
            </label>
            <input
              type="range"
              min={0.5}
              max={0.99}
              step={0.05}
              value={power}
              onChange={(e) => setPower(Number(e.target.value))}
              className="w-full accent-gold"
            />
          </div>
          <button
            onClick={calculatePower}
            className="w-full py-3 bg-navy text-white font-bold rounded-lg hover:bg-navy/90 transition-all"
          >
            Calculate Sample Size
          </button>
        </div>
      )}

      {calcType === 'proportion' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Group 1 Proportion (p₁)</label>
              <input
                type="number"
                min={0.01}
                max={0.99}
                step={0.01}
                value={p1}
                onChange={(e) => setP1(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Group 2 Proportion (p₂)</label>
              <input
                type="number"
                min={0.01}
                max={0.99}
                step={0.01}
                value={p2}
                onChange={(e) => setP2(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
              Margin of Error: <span className="text-navy">±{(margin * 100).toFixed(1)}%</span>
            </label>
            <input
              type="range"
              min={0.01}
              max={0.2}
              step={0.01}
              value={margin}
              onChange={(e) => setMargin(Number(e.target.value))}
              className="w-full accent-gold"
            />
          </div>
          <button
            onClick={calculateProportion}
            className="w-full py-3 bg-navy text-white font-bold rounded-lg hover:bg-navy/90 transition-all"
          >
            Calculate Sample Size
          </button>
        </div>
      )}

      {calcType === 'cochran-prop' && (
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 mb-4">
            <strong>Cochran's Formula:</strong> n₀ = (Z² × p × (1-p)) / e²
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Confidence Level</label>
              <select
                value={confLevel}
                onChange={(e) => setConfLevel(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm"
              >
                <option value={0.90}>90%</option>
                <option value={0.95}>95%</option>
                <option value={0.99}>99%</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Estimated Proportion (p)</label>
              <input
                type="number"
                min={0.01}
                max={0.99}
                step={0.01}
                value={estProp}
                onChange={(e) => setEstProp(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
              Margin of Error (e): <span className="text-navy">±{(cochranMargin * 100).toFixed(1)}%</span>
            </label>
            <input
              type="range"
              min={0.01}
              max={0.15}
              step={0.01}
              value={cochranMargin}
              onChange={(e) => setCochranMargin(Number(e.target.value))}
              className="w-full accent-gold"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Population Size (optional)</label>
            <input
              type="number"
              min={1}
              placeholder="Leave empty for infinite"
              value={population || ''}
              onChange={(e) => setPopulation(e.target.value ? Number(e.target.value) : null)}
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm"
            />
            <p className="text-[10px] text-slate-400 mt-1">If unknown, leave empty to use infinite population correction</p>
          </div>
          <button
            onClick={calculateCochranProportion}
            className="w-full py-3 bg-navy text-white font-bold rounded-lg hover:bg-navy/90 transition-all"
          >
            Calculate Sample Size
          </button>
        </div>
      )}

      {calcType === 'cochran-mean' && (
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 mb-4">
            <strong>Cochran's Formula:</strong> n₀ = (Z² × σ²) / e²
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Confidence Level</label>
              <select
                value={confLevel}
                onChange={(e) => setConfLevel(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm"
              >
                <option value={0.90}>90%</option>
                <option value={0.95}>95%</option>
                <option value={0.99}>99%</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Standard Deviation (σ)</label>
              <input
                type="number"
                min={0.01}
                step={0.01}
                value={stdDev}
                onChange={(e) => setStdDev(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
              Margin of Error (e): <span className="text-navy">±{meanMargin}</span>
            </label>
            <input
              type="range"
              min={0.5}
              max={10}
              step={0.5}
              value={meanMargin}
              onChange={(e) => setMeanMargin(Number(e.target.value))}
              className="w-full accent-gold"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Population Size (optional)</label>
            <input
              type="number"
              min={1}
              placeholder="Leave empty for infinite"
              value={population || ''}
              onChange={(e) => setPopulation(e.target.value ? Number(e.target.value) : null)}
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm"
            />
            <p className="text-[10px] text-slate-400 mt-1">If unknown, leave empty to use infinite population correction</p>
          </div>
          <button
            onClick={calculateCochranMean}
            className="w-full py-3 bg-navy text-white font-bold rounded-lg hover:bg-navy/90 transition-all"
          >
            Calculate Sample Size
          </button>
        </div>
      )}

      {result !== null && (
        <div className="mt-6 p-6 bg-gradient-to-br from-navy to-navy-light rounded-xl text-center">
          <div className="text-blue-200 text-xs uppercase tracking-widest mb-2">{resultLabel}</div>
          <div className="text-5xl font-bold text-white font-playfair">{result}</div>
          {calcType === 'power' && <div className="text-gold text-sm mt-2">Total: {result * 2} participants</div>}
        </div>
      )}

      <div className="mt-4 p-4 bg-slate-50 rounded-lg text-xs text-slate-500">
        <strong>Note:</strong> This calculator provides estimates based on simplified formulas. For precise calculations, use G*Power software or consult with your assigned URS.
      </div>
    </div>
  );
}

// ============================================================================
// RESOURCES PAGE
// ============================================================================
function ResourcesPage() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [showCalculator, setShowCalculator] = useState(false);
  const categories = ['All', ...Array.from(new Set(RESOURCES.map(r => r.category)))];

  const filtered = RESOURCES.filter(r => {
    const matchCat = filter === 'All' || r.category === filter;
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="pt-24 pb-16 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-3">
            <BookMarked size={16} className="text-gold" />
            <span className="text-gold text-xs tracking-widest uppercase font-semibold">Curated Materials</span>
          </div>
          <h1 className="text-4xl font-bold text-navy font-playfair mb-3">Methodology Resource Hub</h1>
          <p className="text-slate-500 max-w-lg mx-auto">Handpicked tools, guides, and references for quantitative, qualitative, and mixed-methods researchers.</p>
        </div>

        {/* Sample Size Calculator */}
        <Card className="mb-12 overflow-hidden">
          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className="w-full p-6 flex items-center justify-between bg-gradient-to-r from-navy to-navy-light text-white"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gold/20 flex items-center justify-center">
                <CalcIcon size={24} className="text-gold" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold font-playfair">Sample Size Calculator</h3>
                <p className="text-blue-200 text-sm">Calculate required sample size by effect size or proportions</p>
              </div>
            </div>
            {showCalculator ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          {showCalculator && (
            <div className="p-6 border-t border-slate-200">
              <SampleSizeCalculator />
            </div>
          )}
        </Card>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-10 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search resources..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-navy"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${filter === c ? 'bg-navy text-white border-navy' : 'bg-white text-slate-600 border-slate-200 hover:border-navy'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {filtered.map((res) => (
            <Card key={res.id} className="p-6 hover:border-gold transition-all group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{res.category}</span>
                <div className="w-9 h-9 rounded-xl bg-navy/5 group-hover:bg-gold/15 flex items-center justify-center transition-all">
                  <FlaskConical size={16} className="text-navy group-hover:text-gold transition-all" />
                </div>
              </div>
              <h3 className="text-[15px] font-bold text-navy leading-snug mb-2 font-playfair group-hover:text-gold transition-colors">{res.title}</h3>
              <p className="text-slate-500 text-[13px] leading-relaxed mb-4">{res.description}</p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {res.tags.map((t) => (
                  <span key={t} className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[10px] font-medium">{t}</span>
                ))}
              </div>
              <a href={res.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-navy text-sm font-semibold group-hover:text-gold transition-colors">
                Open Resource <ExternalLink size={13} />
              </a>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <Search size={32} className="mx-auto mb-3 opacity-40" />
            <p>No resources match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// SERVICES PAGE
// ============================================================================
function ServicesPage() {
  const [clientType, setClientType] = useState('SLU Graduate / Staff');
  const [service, setService] = useState('consultation');
  const [hours, setHours] = useState(2);
  const [formStep, setFormStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const feeData = FEE_TABLE[clientType]?.[service];
  const total = service === 'consultation' ? feeData?.rate * hours : feeData?.rate;

  const handleSubmit = () => setSubmitted(true);

  return (
    <div className="pt-24 pb-16 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-3">
            <FileText size={16} className="text-gold" />
            <span className="text-gold text-xs tracking-widest uppercase font-semibold">FM-RIS-002</span>
          </div>
          <h1 className="text-4xl font-bold text-navy font-playfair mb-3">Digital Service Request Portal</h1>
          <p className="text-slate-500 max-w-lg mx-auto">Complete this form to avail of RSS services. Upon submission, a personal Google Drive folder will be created for your project files (Manuscript, Data Gathering Tool, Data Files, and Others). Your request will be reviewed by the ISM Officer who will confirm schedule and payment details.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Google Form Embed */}
          <Card className="overflow-hidden">
            <div className="bg-navy px-6 py-4">
              <h2 className="text-white font-bold text-lg font-playfair">Official Service Request Form</h2>
              <p className="text-blue-300 text-xs">FM-RIS-002</p>
            </div>
            <div className="p-1 bg-slate-100">
              <div className="bg-white rounded-lg overflow-hidden" style={{ height: '600px' }}>
                <iframe
                  src="https://docs.google.com/forms/d/e/1FAIpQLSdnkH04yWy6kNBpYNqr_K65psg_4lA4yUSDIHYrMj8HUqSvuA/viewform?embedded=true"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  title="ISRM Service Request Form"
                  className="rounded-lg"
                >
                  Loading...
                </iframe>
              </div>
            </div>
          </Card>

          {/* Fee Calculator */}
          <div className="space-y-8">
            <Card className="overflow-hidden">
              <div className="bg-navy px-6 py-4">
                <h2 className="text-white font-bold text-lg font-playfair">Interactive Fee Calculator</h2>
                <p className="text-blue-300 text-xs">Based on MOPG 2022 rate schedule</p>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Your Affiliation</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(FEE_TABLE).map((t) => (
                      <button
                        key={t}
                        onClick={() => setClientType(t)}
                        className={`text-left px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all ${clientType === t ? 'bg-navy text-white border-navy' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Service Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'consultation', label: 'Consultation', icon: Clock },
                      { key: 'fullAssistance', label: 'Full Assistance', icon: FileText },
                    ].map((s) => (
                      <button
                        key={s.key}
                        onClick={() => setService(s.key)}
                        className={`flex items-center gap-2 py-3 px-3 rounded-xl border text-xs font-semibold transition-all ${service === s.key ? 'bg-gold/15 border-gold text-navy' : 'bg-white text-slate-500 border-slate-200'}`}
                      >
                        <s.icon size={16} />
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {service === 'consultation' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                      Number of Hours: <span className="text-navy text-base">{hours}</span>
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={hours}
                      onChange={(e) => setHours(Number(e.target.value))}
                      className="w-full accent-gold"
                    />
                  </div>
                )}

                <div className="rounded-xl bg-gradient-to-br from-navy to-navy-light p-5">
                  <div className="text-blue-200 text-xs mb-1 uppercase tracking-widest">Estimated Fee</div>
                  <div className="text-4xl font-bold text-white font-playfair">₱{total?.toLocaleString()}</div>
                  <div className="text-gold text-xs">{feeData?.unit}</div>
                </div>
              </div>
            </Card>

            {/* Fee Reference */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-navy font-playfair mb-4">Fee Reference Guide</h3>
              <div className="space-y-3">
                {[
                  { label: 'SLU Faculty / Grantees', note: 'Consultation free of charge' },
                  { label: 'SLU Undergrad Students', note: '₱200/hr · ₱2,000 full study' },
                  { label: 'SLU Graduate / Staff', note: '₱300/hr · ₱4,500 full study' },
                  { label: 'Non-SLU Clients', note: '₱220–350/hr · ₱2,200–5,000 full' },
                ].map((r) => (
                  <div key={r.label} className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 bg-slate-50">
                    <div className="w-2 h-2 rounded-full bg-gold flex-shrink-0" />
                    <div>
                      <div className="text-sm font-semibold text-navy">{r.label}</div>
                      <div className="text-xs text-slate-500">{r.note}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* File Upload Info */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-navy font-playfair mb-4">Your Google Drive Folder</h3>
              <div className="space-y-4">
                <p className="text-sm text-slate-600">
                  Upon submitting your service request, a dedicated Google Drive folder will be automatically created for your research project.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: '📄', label: 'Manuscript', desc: 'Your research proposal, thesis chapters, draft documents' },
                    { icon: '📋', label: 'Data Gathering Tool', desc: 'Questionnaires, interview guides, observation forms' },
                    { icon: '📊', label: 'Data Files', desc: 'Raw data, SPSS/Excel files, processed datasets' },
                    { icon: '📁', label: 'Others', desc: 'Additional supporting documents, references' },
                  ].map((f) => (
                    <div key={f.label} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="text-lg mb-1">{f.icon}</div>
                      <div className="text-sm font-semibold text-navy">{f.label}</div>
                      <div className="text-xs text-slate-500">{f.desc}</div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-400">
                  You will receive an email with your Drive folder link after submitting the form. Upload your files to the appropriate subfolders for easy access during consultations.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PERSONNEL PAGE
// ============================================================================
function PersonnelPage() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="pt-24 pb-16 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Users size={16} className="text-gold" />
            <span className="text-gold text-xs tracking-widest uppercase font-semibold">Our People</span>
          </div>
          <h1 className="text-4xl font-bold text-navy font-playfair mb-3">Personnel & Responsibilities</h1>
          <p className="text-slate-500 max-w-lg mx-auto">The RSS is staffed by a dedicated ISM Officer and a pool of University Research Statisticians appointed annually to serve the SLU research community.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          {PERSONNEL.map((p, i) => {
            const isOpen = open === i;
            return (
              <Card key={p.role} className="overflow-hidden">
                <div className="bg-gradient-to-br from-navy to-navy-light p-7">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gold/20 border border-gold/30 flex items-center justify-center flex-shrink-0">
                      <IconMap name={p.icon} size={24} className="text-gold" />
                    </div>
                    <div>
                      <div className="text-gold text-[11px] font-bold uppercase tracking-widest mb-1">{p.role}</div>
                      <div className="text-white text-xl font-bold font-playfair">{p.name}</div>
                      <div className="text-blue-300 text-xs mt-1">ISRM / RISE Center</div>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-slate-600 text-sm leading-relaxed mb-5">{p.description}</p>
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex items-center justify-between w-full text-left group"
                  >
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Key Responsibilities</span>
                    {isOpen ? <ChevronUp size={15} className="text-gold" /> : <ChevronDown size={15} className="text-slate-400" />}
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 mt-4' : 'max-h-0'}`}>
                    <ul className="space-y-2">
                      {p.responsibilities.map((r) => (
                        <li key={r} className="flex items-start gap-2.5 text-sm text-slate-600">
                          <ChevronRight size={14} className="text-gold mt-0.5 flex-shrink-0" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Contact */}
        <Card className="max-w-4xl mx-auto p-8 bg-navy border-none">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            {[
              { icon: Phone, label: 'Telephone', value: '(074) 444-8246 to 48 loc. 387' },
              { icon: Mail, label: 'Email', value: 'isrm.officer@slu.edu.ph' },
              { icon: BookOpen, label: 'Office', value: '2/F Administrative Center, SLU' },
            ].map((c) => (
              <div key={c.label} className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/25 flex items-center justify-center">
                  <c.icon size={18} className="text-gold" />
                </div>
                <div className="text-blue-300 text-[11px] uppercase tracking-widest">{c.label}</div>
                <div className="text-white text-sm font-semibold">{c.value}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ============================================================================
// DASHBOARD PAGE (PRIVATE) - Full Officer Dashboard with Sidebar
// ============================================================================
function DashboardPage({ onLogout, showToast }: { onLogout: () => void; showToast?: (msg: string, type: 'success' | 'error' | 'info') => void }) {
  const [clients, setClients] = useState<any[]>([]);
  const [ursList, setUrsList] = useState<any[]>([]);
  const [financial, setFinancial] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [activeSection, setActiveSection] = useState(() => sessionStorage.getItem('officerSection') || 'dashboard');

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Save active section to session storage
  useEffect(() => {
    sessionStorage.setItem('officerSection', activeSection);
  }, [activeSection]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const data = await getDashboardData();
      setClients(data.clients || []);
      setUrsList(data.urs || []);
      setFinancial(data.financial || {});
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = filter === 'all' 
    ? clients 
    : clients.filter((c: any) => c['Status'] === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-100 text-emerald-800';
      case 'In Progress': return 'bg-amber-100 text-amber-800';
      case 'New': return 'bg-blue-100 text-blue-800';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'clients', label: 'Clients' },
    { id: 'financial', label: 'Financial' },
    { id: 'urs', label: 'URS Registry' },
    { id: 'reports', label: 'Reports' },
  ];

  if (loading) {
    return (
      <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-navy border-t-gold rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-navy text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">ISRM Officer's Command Center</h1>
          <p className="text-blue-200 text-sm">Saint Louis University - RISE Center</p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 bg-navy-light text-white rounded-lg hover:bg-navy/80 transition-all"
        >
          <Lock size={16} /> Logout
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-slate-200 min-h-screen">
          <nav className="p-4">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition-all ${
                  activeSection === item.id
                    ? 'bg-navy text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {activeSection === 'dashboard' && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card className="p-5 text-center">
                  <div className="text-3xl font-bold text-navy">{financial.totalCount || 0}</div>
                  <div className="text-xs text-slate-500 uppercase mt-1">Total Clients</div>
                </Card>
                <Card className="p-5 text-center">
                  <div className="text-3xl font-bold text-emerald-600">{financial.paidCount || 0}</div>
                  <div className="text-xs text-slate-500 uppercase mt-1">Paid</div>
                </Card>
                <Card className="p-5 text-center">
                  <div className="text-3xl font-bold text-amber-600">{financial.pendingCount || 0}</div>
                  <div className="text-xs text-slate-500 uppercase mt-1">Pending</div>
                </Card>
                <Card className="p-5 text-center">
                  <div className="text-3xl font-bold text-gold">₱{(financial.grossFees || 0).toLocaleString()}</div>
                  <div className="text-xs text-slate-500 uppercase mt-1">Total Revenue</div>
                </Card>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-6">
                  <h3 className="font-bold text-navy mb-4">By Status</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between"><span className="text-slate-600">New</span><span className="font-bold text-blue-600">{financial.newCount || 0}</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">In Progress</span><span className="font-bold text-amber-600">{financial.inProgressCount || 0}</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">Completed</span><span className="font-bold text-emerald-600">{financial.completedCount || 0}</span></div>
                  </div>
                </Card>
                <Card className="p-6">
                  <h3 className="font-bold text-navy mb-4">💰 Financial Split (60/40)</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between"><span className="text-slate-600">Gross Fees</span><span className="font-bold text-navy">₱{(financial.grossFees || 0).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">URS (60%)</span><span className="font-bold text-gold">₱{(financial.ursHonoraria || 0).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">Unit (40%)</span><span className="font-bold text-navy">₱{(financial.unitShare || 0).toLocaleString()}</span></div>
                  </div>
                </Card>
                <Card className="p-6">
                  <h3 className="font-bold text-navy mb-4">📊 Quick Actions</h3>
                  <div className="space-y-2">
                    <button onClick={() => setActiveSection('clients')} className="w-full text-left px-3 py-2 bg-slate-100 rounded hover:bg-slate-200 text-sm">View All Clients</button>
                    <button onClick={() => setActiveSection('reports')} className="w-full text-left px-3 py-2 bg-slate-100 rounded hover:bg-slate-200 text-sm">Generate Reports</button>
                    <button onClick={() => setActiveSection('urs')} className="w-full text-left px-3 py-2 bg-slate-100 rounded hover:bg-slate-200 text-sm">Manage URS</button>
                  </div>
                </Card>
              </div>
            </>
          )}

          {activeSection === 'clients' && (
            <>
              {/* Filter */}
              <div className="flex flex-wrap gap-2 mb-4">
                {['all', 'New', 'In Progress', 'Completed'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      filter === f 
                        ? 'bg-navy text-white' 
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {f === 'all' ? 'All' : f}
                  </button>
                ))}
              </div>

              {/* Clients Table */}
              <Card className="overflow-hidden">
                <div className="bg-navy px-6 py-4">
                  <h2 className="text-white font-bold text-lg">Client Records ({filteredClients.length})</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Record ID</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Client</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Research</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Service</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Fee</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Payment</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">URS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredClients.slice(0, 50).map((client: any, idx: number) => (
                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="px-4 py-3 text-sm font-medium text-navy">{client['Record ID'] || '-'}</td>
                          <td className="px-4 py-3 text-sm">
                            <div className="font-medium text-navy">{client['Client Name'] || '-'}</div>
                            <div className="text-xs text-slate-400">{client['Email'] || '-'}</div>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600 max-w-xs truncate">{client['Research Title'] || '-'}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">{client['Service Type'] || '-'}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gold">₱{parseFloat(client['Total Fee (₱)'] || 0).toLocaleString()}</td>
                          <td className={`px-4 py-3 text-sm font-medium ${client['Payment Status'] === 'Paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {client['Payment Status'] || '-'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(client['Status'])}`}>
                              {client['Status'] || 'New'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">{client['Assigned URS'] || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}

          {activeSection === 'financial' && (
            <Card className="p-6">
              <h2 className="text-xl font-bold text-navy mb-6">💰 Financial Summary</h2>
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-slate-50 rounded-lg">
                  <div className="text-3xl font-bold text-navy mb-2">₱{(financial.grossFees || 0).toLocaleString()}</div>
                  <div className="text-slate-500">Gross Fees (100%)</div>
                </div>
                <div className="text-center p-6 bg-gold/10 rounded-lg">
                  <div className="text-3xl font-bold text-gold mb-2">₱{(financial.ursHonoraria || 0).toLocaleString()}</div>
                  <div className="text-slate-500">URS Honoraria (60%)</div>
                </div>
                <div className="text-center p-6 bg-navy/10 rounded-lg">
                  <div className="text-3xl font-bold text-navy mb-2">₱{(financial.unitShare || 0).toLocaleString()}</div>
                  <div className="text-slate-500">Unit Share (40%)</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border border-slate-200 rounded-lg">
                  <div className="text-slate-500 text-sm mb-1">Paid Clients</div>
                  <div className="text-2xl font-bold text-emerald-600">{financial.paidCount || 0}</div>
                </div>
                <div className="p-4 border border-slate-200 rounded-lg">
                  <div className="text-slate-500 text-sm mb-1">Pending Payment</div>
                  <div className="text-2xl font-bold text-amber-600">{financial.pendingCount || 0}</div>
                </div>
              </div>
            </Card>
          )}

          {activeSection === 'urs' && (
            <Card className="p-6">
              <h2 className="text-xl font-bold text-navy mb-6">👥 URS Registry</h2>
              {ursList.length === 0 ? (
                <p className="text-slate-400">No URS found in registry.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">URS ID</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Full Name</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Department</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ursList.map((urs: any, idx: number) => (
                        <tr key={idx} className="border-b border-slate-100">
                          <td className="px-4 py-3 text-sm text-slate-600">{urs['URS ID'] || '-'}</td>
                          <td className="px-4 py-3 text-sm font-medium text-navy">{urs['Full Name'] || '-'}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">{urs['Department'] || '-'}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">{urs['Email'] || '-'}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${urs['Status'] === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                              {urs['Status'] || '-'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}

          {activeSection === 'reports' && (
            <Card className="p-6">
              <h2 className="text-xl font-bold text-navy mb-6">📄 Reports</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                  <h3 className="font-bold text-navy mb-2">FM-RIS-059 Semestral Report</h3>
                  <p className="text-sm text-slate-500">Generate semestral summary of all statistical services.</p>
                </div>
                <div className="p-6 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                  <h3 className="font-bold text-navy mb-2">FM-RIS-060 Honoraria Requisition</h3>
                  <p className="text-sm text-slate-500">Generate requisition for URS honoraria distribution.</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 mt-4">Note: Report generation is done via Google Sheet. Go to Extensions → Apps Script → Generate Reports in your dashboard.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// URS LOGIN PAGE
// ============================================================================
function URSLoginPage({ onLogin }: { onLogin: (name: string) => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!name || !email || !password) {
      setError('Please enter your name, email, and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Call API to validate credentials
      const result = await validateURSCredentials(name, email, password);
      
      if (result.success && result.valid) {
        // Use the name from the response (normalized from database)
        onLogin(result.name || name);
      } else {
        setError(result.message || 'Invalid credentials. Please check your name, email, and password.');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-16 bg-slate-50 min-h-screen">
      <div className="max-w-md mx-auto px-6">
        <Card className="p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-navy/10 flex items-center justify-center mx-auto mb-4">
              <GraduationCap size={32} className="text-navy" />
            </div>
            <h2 className="text-2xl font-bold text-navy font-playfair">URS Portal Login</h2>
            <p className="text-slate-500 text-sm mt-2">Enter your credentials to access your dashboard</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name as registered"
                className="w-full border border-slate-200 rounded-lg px-4 py-3"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Your Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your SLU email"
                className="w-full border border-slate-200 rounded-lg px-4 py-3"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Your Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full border border-slate-200 rounded-lg px-4 py-3"
              />
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-3 bg-navy text-white font-bold rounded-lg hover:bg-navy/90 transition-all disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Access My Dashboard'}
            </button>
          </div>

          <p className="text-xs text-slate-400 text-center mt-4">
            Contact the ISRM Officer if you cannot access your account.
          </p>
        </Card>
      </div>
    </div>
  );
}

// ============================================================================
// URS DASHBOARD PAGE
// ============================================================================
function URSDashboardPage({ ursName, onLogout, showToast }: { ursName: string; onLogout: () => void; showToast?: (msg: string, type: 'success' | 'error' | 'info') => void }) {
  const [clients, setClients] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingClient, setEditingClient] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadURSData();
  }, [ursName]);

  const loadURSData = async () => {
    setLoading(true);
    try {
      const result = await getURSClients(ursName);
      
      if (result.success) {
        setClients(result.clients || []);
        setSummary(result.summary || {});
      } else {
        throw new Error('Failed to load data');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load your dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-100 text-emerald-800';
      case 'In Progress': return 'bg-amber-100 text-amber-800';
      case 'New': return 'bg-blue-100 text-blue-800';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getPaymentColor = (status: string) => {
    return status === 'Paid' ? 'text-emerald-600' : 'text-amber-600';
  };

  const handleEditClient = (client: any) => {
    setEditingClient(client['Record ID']);
    setEditStatus(client['Status'] || 'New');
    setEditNotes('');
  };

  const handleSaveStatus = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!editingClient) return false;
    setUpdating(true);
    try {
      console.log('Saving - recordId:', editingClient, 'status:', editStatus, 'notes:', editNotes);
      const result = await updateClientStatus(editingClient, editStatus, editNotes);
      console.log('API Result:', result);
      if (result.success) {
        // Update local state immediately
        setClients(prevClients => prevClients.map(c => 
          c['Record ID'] === editingClient 
            ? { ...c, 'Status': editStatus, 'Remarks': editNotes ? ((c['Remarks'] || '') + '\n[' + new Date().toLocaleString() + '] ' + editNotes) : c['Remarks'] }
            : c
        ));
        // Exit edit mode immediately on success
        setEditingClient(null);
        showToast?.('Status updated successfully!', 'success');
      } else {
        showToast?.(result.message || 'Failed to update', 'error');
      }
    } catch (err: any) {
      console.error('Error:', err);
      showToast?.('Failed to connect. Please try again.', 'error');
    } finally {
      setUpdating(false);
    }
    return false;
  };

  const handleCancelEdit = () => {
    setEditingClient(null);
    setEditStatus('');
    setEditNotes('');
  };

  if (loading) {
    return (
      <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-navy border-t-gold rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">Loading your assigned clients...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <div className="text-center text-red-500">
            <AlertCircle size={48} className="mx-auto mb-4" />
            <p>{error}</p>
            <button onClick={loadURSData} className="mt-4 px-4 py-2 bg-navy text-white rounded-lg">
              Try Again
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-gold text-xs tracking-widest uppercase font-semibold">Welcome back</span>
            </div>
            <h1 className="text-3xl font-bold text-navy font-playfair">{ursName}</h1>
            <p className="text-slate-500">University Research Statistician</p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-all"
          >
            <Lock size={16} /> Logout
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-5 text-center">
            <div className="text-3xl font-bold text-navy">{summary.totalClients || 0}</div>
            <div className="text-xs text-slate-500 uppercase mt-1">Total Clients</div>
          </Card>
          <Card className="p-5 text-center">
            <div className="text-3xl font-bold text-amber-600">{summary.inProgress || 0}</div>
            <div className="text-xs text-slate-500 uppercase mt-1">In Progress</div>
          </Card>
          <Card className="p-5 text-center">
            <div className="text-3xl font-bold text-emerald-600">{summary.completed || 0}</div>
            <div className="text-xs text-slate-500 uppercase mt-1">Completed</div>
          </Card>
          <Card className="p-5 text-center">
            <div className="text-3xl font-bold text-gold">₱{(summary.totalEarnings || 0).toLocaleString()}</div>
            <div className="text-xs text-slate-500 uppercase mt-1">Total Earnings</div>
          </Card>
        </div>

        {/* Clients Table */}
        <Card className="overflow-hidden">
          <div className="bg-navy px-6 py-4">
            <h2 className="text-white font-bold text-lg font-playfair">My Assigned Clients</h2>
          </div>

          {clients.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Users size={48} className="mx-auto mb-4 opacity-40" />
              <p>No clients assigned to you yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Record ID</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Research</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Service</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">My Share</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Notes</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr key={client['Record ID']} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-medium text-navy">{client['Record ID'] || '-'}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="font-medium text-navy">{client['Client Name'] || '-'}</div>
                        <div className="text-xs text-slate-400">{client['Email'] || '-'}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate" title={client['Research Title']}>
                        {client['Research Title'] || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{client['Service Type'] || '-'}</td>
                      <td className={`px-6 py-4 text-sm font-medium ${getPaymentColor(client['Payment Status'])}`}>
                        {client['Payment Status'] || '-'}
                      </td>
                      <td className="px-6 py-4">
                        {editingClient === client['Record ID'] ? (
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value)}
                            className="text-xs border border-slate-300 rounded px-2 py-1 bg-white"
                          >
                            <option value="New">New</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                        ) : (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(client['Status'])}`}>
                            {client['Status'] || 'New'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gold">
                        ₱{parseFloat(client['URS Share 60% (₱)'] || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600 max-w-48" title={client['Remarks'] || ''}>
                        <div className="truncate" title={client['Remarks'] || ''}>
                          {client['Remarks'] || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {editingClient === client['Record ID'] ? (
                          <form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); handleSaveStatus(); }}>
                            <div className="flex flex-col gap-2">
                              <textarea
                                value={editNotes}
                                onChange={(e) => setEditNotes(e.target.value)}
                                placeholder="Add notes..."
                                onKeyDown={(e) => e.key !== 'Enter' || e.shiftKey || e.preventDefault()}
                                className="text-xs border border-slate-300 rounded px-2 py-1 w-32 h-16 resize-none"
                              />
                              <div className="flex gap-1">
                                <button
                                  type="submit"
                                  disabled={updating}
                                  className="px-2 py-1 bg-emerald-600 text-white text-xs rounded hover:bg-emerald-700 disabled:opacity-50"
                                >
                                  {updating ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingClient(null); }}
                                  className="px-2 py-1 bg-slate-300 text-slate-700 text-xs rounded hover:bg-slate-400"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </form>
                        ) : (
                          <div className="flex items-center gap-2">
                            {client['Drive Folder URL'] && (
                              <a
                                href={client['Drive Folder URL']}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-navy text-white text-xs font-medium rounded hover:bg-navy/90"
                              >
                                <FolderOpen size={14} /> Drive
                              </a>
                            )}
                            <button
                              onClick={() => handleEditClient(client)}
                              className="px-2 py-1.5 bg-amber-100 text-amber-700 text-xs font-medium rounded hover:bg-amber-200"
                            >
                              Edit
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// ============================================================================
// FOOTER
// ============================================================================
function Footer() {
  return (
    <footer className="bg-navy-dark text-blue-300 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-gold flex items-center justify-center">
                <Activity size={17} className="text-navy" />
              </div>
              <div>
                <div className="text-white font-bold tracking-widest text-sm uppercase">ISRM · RISE Center</div>
                <div className="text-gold text-[10px] tracking-widest uppercase">Saint Louis University</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Providing research statistical consultation, training, and methodology support to the SLU research community.
            </p>
          </div>
          <div>
            <div className="text-white font-bold text-xs uppercase tracking-widest mb-4">Quick Links</div>
            <ul className="space-y-2 text-sm">
              {['Live Updates', 'Resources', 'Services', 'Personnel'].map((l) => (
                <li key={l}><a href={`#${l.toLowerCase()}`} className="hover:text-gold transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-white font-bold text-xs uppercase tracking-widest mb-4">Contact</div>
            <ul className="space-y-2 text-sm">
              <li>(074) 444-8246 to 48 loc. 387</li>
              <li>isrm.officer@slu.edu.ph</li>
              <li>2/F Administrative Center, SLU</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 text-center text-xs text-blue-500">
          © 2026 ISRM Unit · RISE Center · Saint Louis University · Baguio City, Philippines
        </div>
      </div>
    </footer>
  );
}

// ============================================================================
// MAIN APP
// ============================================================================
export default function App() {
  const [currentPage, setCurrentPage] = useState(() => sessionStorage.getItem('currentPage') || 'home');
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem('officerAuthenticated') === 'true');
  const [ursAuthenticated, setURSAuthenticated] = useState(false);
  const [ursName, setURSName] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(false);
  const [toast, setToast] = useState<{message: string; type: 'success' | 'error' | 'info'} | null>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [liveUpdates, setLiveUpdates] = useState<any[]>([]);

  // Toast helper function
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch content from Google Sheets on load
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const [annRes, updateRes] = await Promise.all([
          getAnnouncements(),
          getLiveUpdates()
        ]);
        if (annRes.success && annRes.announcements.length > 0) {
          setAnnouncements(annRes.announcements);
        }
        if (updateRes.success && updateRes.updates.length > 0) {
          setLiveUpdates(updateRes.updates);
        }
      } catch (err) {
        console.log('Using default content');
      }
    };
    fetchContent();
  }, []);

  // Save currentPage to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem('currentPage', currentPage);
  }, [currentPage]);

  // Check for saved URS session on load
  useEffect(() => {
    const savedURSName = sessionStorage.getItem('ursName');
    const savedURSAuth = sessionStorage.getItem('ursAuthenticated');
    if (savedURSName && savedURSAuth === 'true') {
      setURSName(savedURSName);
      setURSAuthenticated(true);
    }
  }, []);

  const CORRECT_PASSWORD = OFFICER_PASSWORD; // From api.ts

  const handleLogin = () => {
    if (password === CORRECT_PASSWORD) {
      setIsAuthenticated(true);
      setCurrentPage('dashboard');
      setAuthError(false);
      // Save officer session
      sessionStorage.setItem('officerAuthenticated', 'true');
    } else {
      setAuthError(true);
    }
  };

  const handleLogout = () => {
    // Clear URS session
    sessionStorage.removeItem('ursName');
    sessionStorage.removeItem('ursAuthenticated');
    // Clear officer session
    sessionStorage.removeItem('officerAuthenticated');
    sessionStorage.removeItem('currentPage');
    sessionStorage.removeItem('officerSection');
    setIsAuthenticated(false);
    setURSAuthenticated(false);
    setURSName('');
    setCurrentPage('home');
    setPassword('');
  };

  // Check for saved officer session on load
  useEffect(() => {
    const savedOfficerAuth = sessionStorage.getItem('officerAuthenticated');
    if (savedOfficerAuth === 'true') {
      setIsAuthenticated(true);
      setCurrentPage('dashboard');
    }
  }, []);

  const handlePageChange = (page: string) => {
    if (page === 'dashboard' && !isAuthenticated) {
      // Show password prompt
      const input = prompt('Enter password to access the Officer Portal:');
      if (input === CORRECT_PASSWORD) {
        setIsAuthenticated(true);
        setCurrentPage('dashboard');
      } else if (input !== null) {
        setAuthError(true);
        alert('Incorrect password. Please try again.');
      }
    } else if (page === 'urs-portal' && !ursAuthenticated) {
      setCurrentPage('urs-portal'); // Will show login form
    } else {
      setCurrentPage(page);
      window.scrollTo(0, 0);
    }
  };

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Source+Serif+4:ital,wght@0,300;0,400;0,600;0,700;1,400&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar currentPage={currentPage} setPage={handlePageChange} />
      
      {currentPage === 'home' && <HomePage setPage={handlePageChange} announcements={announcements} liveUpdates={liveUpdates} />}
      {currentPage === 'updates' && <LiveUpdatesPage liveUpdates={liveUpdates} />}
      {currentPage === 'resources' && <ResourcesPage />}
      {currentPage === 'services' && <ServicesPage />}
      {currentPage === 'personnel' && <PersonnelPage />}
      {currentPage === 'dashboard' && isAuthenticated && <DashboardPage onLogout={handleLogout} showToast={showToast} />}
      {currentPage === 'dashboard' && !isAuthenticated && (
        <div className="pt-32 pb-16 min-h-screen flex items-center justify-center">
          <Card className="p-8 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-navy/10 flex items-center justify-center mx-auto mb-4">
                <Lock size={32} className="text-navy" />
              </div>
              <h2 className="text-2xl font-bold text-navy font-playfair">Officer Portal</h2>
              <p className="text-slate-500 text-sm mt-2">Enter your password to access the Command Center</p>
            </div>
            <div className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="Enter password"
                className="w-full border border-slate-200 rounded-lg px-4 py-3 text-center"
              />
              {authError && <p className="text-red-500 text-sm text-center">Incorrect password</p>}
              <button
                onClick={handleLogin}
                className="w-full py-3 bg-navy text-white font-bold rounded-lg hover:bg-navy/90 transition-all"
              >
                Access Portal
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* URS Portal - Login or Dashboard */}
      {currentPage === 'urs-portal' && !ursAuthenticated && (
        <URSLoginPage 
          onLogin={(name) => {
            setURSName(name);
            setURSAuthenticated(true);
            // Save to session storage
            sessionStorage.setItem('ursName', name);
            sessionStorage.setItem('ursAuthenticated', 'true');
          }} 
        />
      )}
      {currentPage === 'urs-portal' && ursAuthenticated && (
        <URSDashboardPage 
          ursName={ursName} 
          onLogout={handleLogout}
          showToast={showToast}
        />
      )}
      
      <Footer />
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' :
          toast.type === 'error' ? 'bg-red-600 text-white' :
          'bg-navy text-white'
        }`}>
          <div className="flex items-center gap-2">
            {toast.type === 'success' && <CheckCircle size={18} />}
            {toast.type === 'error' && <AlertCircle size={18} />}
            {toast.type === 'info' && <Bell size={18} />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
