import { useMemo, useState } from 'react';
import { ArrowLeft, BarChart3, CalendarDays, ChartNoAxesCombined, ChevronDown, ClipboardList, Factory, GitCompare, Home, LayoutDashboard, Menu, Package, Receipt, Scissors, Settings2, ShieldCheck, ShoppingBag, SlidersHorizontal, Sprout, Store, TrendingUp, UserRound, Users, Wallet, LogOut, type LucideIcon } from 'lucide-react';
import { modules, products, initialSales, filtered, type Sale, type Filters } from '@/data/demo';
import { Analytics } from '@/home/analytics';
import { Sales } from '@/home/sales';
import { Operations } from '@/home/operations';
import { Inventory } from '@/home/inventory';
import { DashboardIndicators, TrendAnalysis } from '@/components/dashboard/dashboard-indicators';
import { usePersistentState } from '@/hooks/use-persistent-state';
import type { TramaUser } from '@/lib/auth.client';
import { ProfileDialog } from '@/home/profile-dialog';
import { NewFeatures } from '@/home/new-features';

const moduleIcons: Record<string, LucideIcon> = {
  'Visão Geral': Home,
  'Dashboard de Indicadores': ChartNoAxesCombined,
  'Análise de Tendências': TrendingUp,
  'Dados de Vendas': Receipt,
  'Tendências por Categoria': Sprout,
  'Comparação de Produtos': GitCompare,
  'Cenário da Concorrência': Store,
  'Simulador de Cenários Comparativos': SlidersHorizontal,
  'Estoque': Package,
  'Produção': Factory,
  'Vendas e Pedidos': ShoppingBag,
  'Financeiro': Wallet,
  'Clientes e Fornecedores': Users,
  'Cadastros': ClipboardList,
  'Relatórios e Indicadores': BarChart3,
  'Agenda e Notificações': CalendarDays,
  'Equipe e Permissões': ShieldCheck,
  'Configurações': Settings2,
  'Simulador de Impacto da Concorrência': SlidersHorizontal,
  'Gerenciamento de Categorias': ClipboardList,
  'Gerenciamento de Confecções': Factory,
  'Lançamento de Vendas': Receipt,
};

const sectionLabels: Record<number, string> = {
  0: 'VISÃO DO NEGÓCIO',
  1: 'INDICADORES',
  3: 'ANÁLISE COMERCIAL',
  8: 'GESTÃO DA OPERAÇÃO',
  14: 'ADMINISTRAÇÃO',
};

function currentPeriodLabel() {
  const now = new Date();
  return `${['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'][now.getMonth()]} de ${now.getFullYear()}`;
}

export function Workspace({ user, exit, onUserUpdated }: { user: TramaUser; exit: () => void; onUserUpdated: (user: TramaUser) => void }) {
  const [mode, setMode] = useState('Visão Geral');
  const [sales, setSales, salesReady] = usePersistentState<Sale[]>(
    `trama:${user.id}:sales`, user.isDemo ? initialSales : [],
  );
  const [menu, setMenu] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [updated, setUpdated] = useState('');
  const [filters, setFilters] = useState<Filters>({
    period: user.isDemo ? 'Outubro de 2026' : currentPeriodLabel(),
    category: 'Todas',
    product: 'Todos',
  });

  const availablePeriods = useMemo(() => {
    const values = new Set(sales.map((sale) => {
      const [year, month] = sale.date.split('-').map(Number);
      return `${['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'][month - 1]} de ${year}`;
    }));
    values.add(currentPeriodLabel());
    const names = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    const order = (label: string) => {
      const [month, year] = label.split(' de ');
      return Number(year) * 12 + names.indexOf(month);
    };
    return [...values].sort((a, b) => order(b) - order(a));
  }, [sales]);

  const current = filtered(sales, filters);
  const previous = filtered(sales, filters, true);
  const storageBase = `trama:${user.id}`;

  const save = (rows: Sale[]) => {
    const withCity = rows.map((row) => ({ ...row, city: row.city || user.city }));
    setSales((existing) => [...existing, ...withCity]);
    setNotice(`${rows.length} venda(s) salva(s). Os indicadores foram atualizados.`);
    setUpdated(new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date()));
  };
  const removeSale = (id: number) => {
    setSales((existing) => existing.filter((sale) => sale.id !== id));
    setNotice('Venda excluída e alteração salva.');
    setUpdated(new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date()));
  };

  const activeDescription: Record<string, string> = {
    'Visão Geral': 'Um panorama do seu negócio, ponto a ponto.',
    'Dashboard de Indicadores': 'Faturamento, volume vendido e categoria líder com filtros por período e cidade.',
    'Análise de Tendências': 'Identifique categorias em alta, estáveis ou em queda a partir das vendas cadastradas.',
    'Dados de Vendas': 'Cadastre, consulte, importe e acompanhe os registros de venda.',
    'Tendências por Categoria': 'Compare categorias e produtos com a análise comercial que já existia na TRAMA.',
    'Comparação de Produtos': 'Compare o desempenho comercial de cada produto.',
    'Simulador de Cenários Comparativos': 'Explore hipóteses de mercado e compare resultados possíveis.',
    'Cadastros': 'Organize as informações básicas utilizadas pelos módulos da plataforma.',
    'Simulador de Impacto da Concorrência': 'Visualize como uma possível perda de mercado afetaria seu faturamento.',
    'Gerenciamento de Categorias': 'Cadastre e organize as categorias utilizadas nos lançamentos.',
    'Gerenciamento de Confecções': 'Gerencie confecções e suas cidades de atuação.',
    'Lançamento de Vendas': 'Registre vendas mensais por categoria e confecção.',
  };

  return <div className="workspace">
    <aside className={menu ? 'sidebar open' : 'sidebar'}>
      <button className="workspace-logo" type="button" onClick={() => { setMode('Visão Geral'); setMenu(false); }} aria-label="Abrir visão geral da TRAMA">
        <img src="/images/trama-logo.png" alt="TRAMA — Tecendo relações no mercado do Agreste" />
      </button>
      <span className="workspace-label">{user.company.toLocaleUpperCase('pt-BR')}</span>
      <nav aria-label="Módulos da plataforma">
        {modules.filter((item) => !['Gerenciamento de Categorias','Gerenciamento de Confecções','Lançamento de Vendas'].includes(item) || (user.role || 'Administrador') === 'Administrador').map((item, index) => {
          const Icon = moduleIcons[item] || LayoutDashboard;
          return <div className="workspace-nav-item" key={item}>
            {sectionLabels[index] && <span className="workspace-label">{sectionLabels[index]}</span>}
            <button className={item === mode ? 'active' : ''} aria-current={item === mode ? 'page' : undefined} onClick={() => { setMode(item); setMenu(false); setNotice(''); }}>
              <span className="nav-icon"><Icon size={16} strokeWidth={1.8} /></span>
              <span className="nav-label">{item}</span>
            </button>
          </div>;
        })}
      </nav>
      <button className="sidebar-exit" onClick={exit}><ArrowLeft size={15} /> Sair da conta</button>
    </aside>

    <div className="workspace-main">
      <header className="workspace-header">
        <div className="workspace-header-company">
          <button className="mobile-toggle" aria-label="Abrir módulos" aria-expanded={menu} onClick={() => setMenu(!menu)}><Menu /></button>
          <span className="workspace-company-icon"><Scissors size={17} /></span>
          <span className="workspace-company-name">{user.company}</span>
          <span className="badge">{user.isDemo ? 'DEMONSTRAÇÃO' : 'CONTA LOCAL'}</span>
        </div>
        <div className="profile-menu-wrap">
          <button
            type="button"
            className="profile-trigger"
            aria-haspopup="menu"
            aria-expanded={profileMenuOpen}
            onClick={() => setProfileMenuOpen((open) => !open)}
          >
            <span className="profile-trigger-copy"><strong>{user.name}</strong><small>{user.role || 'Administrador'}</small></span>
            <span className="avatar">{user.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}</span>
            <ChevronDown size={15} className={profileMenuOpen ? 'profile-chevron is-open' : 'profile-chevron'} />
          </button>
          {profileMenuOpen && <div className="profile-dropdown" role="menu">
            <div className="profile-dropdown-heading"><strong>{user.name}</strong><span>{user.email}</span><small>{user.company}</small></div>
            <button type="button" role="menuitem" onClick={() => { setProfileMenuOpen(false); setProfileOpen(true); }}><UserRound size={16} /> Meu perfil</button>
            <button type="button" role="menuitem" onClick={() => { setProfileMenuOpen(false); setMode('Configurações'); }}><Settings2 size={16} /> Configurações</button>
            <button type="button" role="menuitem" className="profile-dropdown-exit" onClick={() => { setProfileMenuOpen(false); exit(); }}><LogOut size={16} /> Sair da conta</button>
          </div>}
        </div>
      </header>

      <div className="dashboard-body">
        <div className="eyebrow"><LayoutDashboard size={14} /> GESTÃO COM OS PÉS NO CHÃO</div>
        <div className="page-heading"><div><h1>{mode === 'Visão Geral' ? `Olá, ${user.name.split(' ')[0]}.` : mode}</h1><p>{activeDescription[mode] || 'Organize as informações e acompanhe a rotina da sua empresa.'}</p></div><span className="date-label">{currentPeriodLabel().toLocaleUpperCase('pt-BR')}</span></div>

        <div className={user.isDemo ? 'demo-notice' : 'demo-notice account-notice'}>
          {user.isDemo
            ? <><b>Ambiente de demonstração.</b> A Confecção Fio do Agreste e os registros iniciais são fictícios. Você pode testar cadastros e vendas; suas alterações ficam salvas neste navegador.</>
            : <><b>Conta de {user.company}.</b> Seus cadastros e vendas são salvos neste navegador e separados por conta. Para acesso compartilhado entre dispositivos, backup central e autenticação de produção, conecte o backend.</>}
        </div>

        {!salesReady ? <section className="panel">Carregando os dados salvos desta conta…</section> : <>
          {notice && <p role="status" className="notice">{notice}</p>}
          {mode === 'Visão Geral' ? <>
            <div className="filters filter-panel">
              <label>Período<select value={filters.period} onChange={(e) => setFilters({ ...filters, period: e.target.value })}>{availablePeriods.map((value) => <option key={value}>{value}</option>)}</select></label>
              <label>Categoria<select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>{['Todas', ...Array.from(new Set(sales.map((sale) => sale.category)))].map((value) => <option key={value}>{value}</option>)}</select></label>
              <label>Produto<select value={filters.product} onChange={(e) => setFilters({ ...filters, product: e.target.value })}>{['Todos', ...Array.from(new Set([...products.map((p) => p.name), ...sales.map((sale) => sale.product)]))].map((value) => <option key={value}>{value}</option>)}</select></label>
              <span className="updated">Última atualização<br /><b>{updated || 'Dados salvos localmente'}</b></span>
            </div>
            <Analytics current={current} previous={previous} mode={mode} filters={filters} />
          </> : null}

          {mode === 'Dashboard de Indicadores' && <DashboardIndicators sales={sales} defaultCity={user.city} />}
          {mode === 'Análise de Tendências' && <TrendAnalysis sales={sales} defaultCity={user.city} />}

          {mode === 'Tendências por Categoria' || mode === 'Comparação de Produtos' ? (
            <>
              <div className="filters filter-panel">
                <label>Período<select value={filters.period} onChange={(e) => setFilters({ ...filters, period: e.target.value })}>{availablePeriods.map((value) => <option key={value}>{value}</option>)}</select></label>
                <label>Categoria<select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>{['Todas', ...Array.from(new Set(sales.map((sale) => sale.category)))].map((value) => <option key={value}>{value}</option>)}</select></label>
                <label>Produto<select value={filters.product} onChange={(e) => setFilters({ ...filters, product: e.target.value })}>{['Todos', ...Array.from(new Set([...products.map((p) => p.name), ...sales.map((sale) => sale.product)]))].map((value) => <option key={value}>{value}</option>)}</select></label>
              </div>
              <Analytics current={current} previous={previous} mode={mode} filters={filters} />
            </>
          ) : null}

          {mode === 'Dados de Vendas' && <Sales sales={sales} save={save} remove={removeSale} />}
          {['Simulador de Impacto da Concorrência','Gerenciamento de Categorias','Gerenciamento de Confecções','Lançamento de Vendas'].includes(mode) && <NewFeatures mode={mode} sales={sales} setSales={setSales} storageKey={storageBase} isAdmin={(user.role || 'Administrador') === 'Administrador'} />}
          {mode === 'Estoque' && <Inventory storageKey={`${storageBase}:inventory`} demoMode={user.isDemo} />}

          {['Cenário da Concorrência', 'Simulador de Cenários Comparativos', 'Produção', 'Vendas e Pedidos', 'Financeiro', 'Clientes e Fornecedores', 'Relatórios e Indicadores', 'Agenda e Notificações', 'Equipe e Permissões', 'Configurações', 'Cadastros'].includes(mode) && (
            <Operations
              mode={mode}
              sales={sales}
              storageKey={`${storageBase}:operations`}
              demoMode={user.isDemo}
            />
          )}
        </>}
        <div className="dashboard-foot"><span>TRAMA · Feita para quem faz.</span><span>{user.isDemo ? 'Dados de demonstração, editáveis neste navegador.' : 'Dados desta conta salvos neste navegador.'}</span></div>
      </div>
    </div>
    {profileOpen && <ProfileDialog user={user} onClose={() => setProfileOpen(false)} onSaved={onUserUpdated} />}
  </div>;
}
