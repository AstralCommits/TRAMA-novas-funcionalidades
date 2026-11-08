import { useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { money, total, type Sale } from '@/data/demo';
import { usePersistentState } from '@/hooks/use-persistent-state';

type Confection = { id: number; name: string; city: string };
type Scenario = { id: number; name: string; impact: number; real: number; hypothetical: number; createdAt: string };

const CITIES = ['Toritama', 'Caruaru', 'Santa Cruz do Capibaribe'];
const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

export function NewFeatures({ mode, sales, setSales, storageKey, isAdmin }: {
  mode: string; sales: Sale[]; setSales: Dispatch<SetStateAction<Sale[]>>;
  storageKey: string; isAdmin: boolean;
}) {
  const [categories, setCategories] = usePersistentState<string[]>(`${storageKey}:categories`, ['Jeans','Malha','Moda fitness']);
  const [confections, setConfections] = usePersistentState<Confection[]>(`${storageKey}:confections`, []);
  const [scenarios, setScenarios] = usePersistentState<Scenario[]>(`${storageKey}:scenarios`, []);
  const [impact, setImpact] = useState(15);
  const [scenarioName, setScenarioName] = useState('');
  const [showSave, setShowSave] = useState(false);
  const [notice, setNotice] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [confectionName, setConfectionName] = useState('');
  const [city, setCity] = useState(CITIES[0]);
  const [saleCategory, setSaleCategory] = useState('');
  const [saleConfection, setSaleConfection] = useState('');
  const [month, setMonth] = useState(String(new Date().getMonth()+1).padStart(2,'0'));
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [quantity, setQuantity] = useState(1);
  const [saleValue, setSaleValue] = useState(0);
  const real = total(sales);
  const hypothetical = real * (1-impact/100);
  const saved = (message: string) => { setNotice(message); };
  const periodOptions = useMemo(() => Array.from({length:7},(_,i)=>String(new Date().getFullYear()-3+i)),[]);
  if (mode === 'Simulador de Impacto da Concorrência') return <>
    <section className="panel">
      <span className="eyebrow">SIMULAÇÃO MATEMÁTICA · CENÁRIO HIPOTÉTICO</span>
      <h3>Como uma perda de mercado afetaria seu faturamento?</h3>
      <p>O faturamento real considera os registros de venda cadastrados nesta conta. Altere o percentual para visualizar uma hipótese, não uma previsão.</p>
      <label>Percentual de impacto: <strong>{impact}%</strong><input type="range" min="0" max="100" value={impact} onChange={e=>setImpact(Number(e.target.value))}/></label>
      <label>Ou informe o percentual<input type="number" min="0" max="100" value={impact} onChange={e=>setImpact(Math.max(0,Math.min(100,Number(e.target.value))))}/></label>
      <div className="demo-notice"><b>Fórmula utilizada</b><br/>Faturamento Hipotético = Faturamento Histórico × (1 − Percentual/100)<br/>{money(real)} × (1 − {impact}/100)</div>
      <div className="metrics">
        <article><span>Faturamento Real</span><strong>{money(real)}</strong><small>Base histórica cadastrada</small></article>
        <article><span>Faturamento Hipotético</span><strong>{money(hypothetical)}</strong><small>Após impacto de {impact}%</small></article>
        <article><span>Diferença estimada</span><strong>{money(real-hypothetical)}</strong><small>Redução de {impact}%</small></article>
      </div>
      <div className="panel">
        <div className="panel-title"><h3>Comparação visual</h3><span>Faturamento em R$</span></div>
        <div className="bar-row"><div><b>Real</b><span>{money(real)}</span></div><div className="bar-track"><i style={{width:'100%'}}/></div></div>
        <div className="bar-row"><div><b>Hipotético</b><span>{money(hypothetical)}</span></div><div className="bar-track"><i style={{width:`${real ? hypothetical/real*100 : 0}%`}}/></div></div>
      </div>
      <button onClick={()=>{setScenarioName('');setShowSave(true);}}>Salvar Cenário</button>
      {notice&&<p role="status" className="notice">{notice}</p>}
    </section>
    {showSave&&<div className="modal-backdrop"><section className="modal" role="dialog" aria-modal="true" aria-label="Salvar cenário"><h2>Salvar cenário</h2><p>Nomeie esta simulação para consultá-la depois.</p><form onSubmit={e=>{e.preventDefault();if(!scenarioName.trim())return;setScenarios(old=>[{id:Date.now(),name:scenarioName.trim(),impact,real,hypothetical,createdAt:new Date().toLocaleString('pt-BR')},...old]);setShowSave(false);saved('Cenário salvo neste navegador.');}}><label>Nome do cenário<input autoFocus required maxLength={70} value={scenarioName} onChange={e=>setScenarioName(e.target.value)} placeholder="Ex.: Queda de 15% nas vendas"/></label><div className="actions"><button type="button" className="outline-button" onClick={()=>setShowSave(false)}>Cancelar</button><button disabled={!scenarioName.trim()}>Salvar</button></div></form></section></div>}
    <section className="panel"><h3>Cenários salvos</h3>{scenarios.length?<div className="table-wrap"><table><thead><tr><th>Nome</th><th>Impacto</th><th>Faturamento hipotético</th><th>Salvo em</th><th>Ação</th></tr></thead><tbody>{scenarios.map(s=><tr key={s.id}><td>{s.name}</td><td>{s.impact}%</td><td>{money(s.hypothetical)}</td><td>{s.createdAt}</td><td><button className="text-button" onClick={()=>setScenarios(old=>old.filter(x=>x.id!==s.id))}>Excluir</button></td></tr>)}</tbody></table></div>:<p>Nenhum cenário salvo ainda.</p>}</section>
  </>;
  if (!isAdmin) return <section className="panel"><h3>Acesso restrito</h3><p>Esta área está disponível apenas para o perfil Administrador.</p></section>;
  if (mode === 'Gerenciamento de Categorias') return <section className="panel"><span className="eyebrow">ADMINISTRAÇÃO</span><h3>Gerenciamento de categorias</h3><form onSubmit={e=>{e.preventDefault();const name=categoryName.trim();if(!name){saved('Informe o nome da categoria.');return;}if(categories.some(c=>c.toLocaleLowerCase()===name.toLocaleLowerCase())){saved('Categoria já cadastrada.');return;}setCategories(old=>[...old,name]);setCategoryName('');saved('Categoria cadastrada neste navegador.');}}><label>Nome da categoria<input required maxLength={50} value={categoryName} onChange={e=>setCategoryName(e.target.value)} placeholder="Ex.: Jeans"/></label><small>{categoryName.length}/50 caracteres</small><button>Cadastrar categoria</button></form><p role="status" className="notice">{notice}</p><div className="table-wrap"><table><thead><tr><th>Categoria</th><th>Ação</th></tr></thead><tbody>{categories.map(c=><tr key={c}><td>{c}</td><td><button className="text-button" onClick={()=>{if(window.confirm(`Excluir a categoria ${c}?`))setCategories(old=>old.filter(x=>x!==c));}}>Excluir</button></td></tr>)}</tbody></table></div></section>;
  if (mode === 'Gerenciamento de Confecções') return <section className="panel"><span className="eyebrow">ADMINISTRAÇÃO</span><h3>Gerenciamento de confecções</h3><form onSubmit={e=>{e.preventDefault();const name=confectionName.trim();if(confections.some(c=>c.name.toLocaleLowerCase()===name.toLocaleLowerCase())){saved('Confecção já cadastrada.');return;}setConfections(old=>[...old,{id:Date.now(),name,city}]);setConfectionName('');saved('Confecção cadastrada neste navegador.');}}><label>Nome da confecção<input required value={confectionName} onChange={e=>setConfectionName(e.target.value)} placeholder="Nome da confecção"/></label><label>Cidade<select required value={city} onChange={e=>setCity(e.target.value)}>{CITIES.map(c=><option key={c}>{c}</option>)}</select></label><button>Cadastrar confecção</button></form><p role="status" className="notice">{notice}</p><div className="table-wrap"><table><thead><tr><th>Confecção</th><th>Cidade</th><th>Ação</th></tr></thead><tbody>{confections.map(c=><tr key={c.id}><td>{c.name}</td><td>{c.city}</td><td><button className="text-button" onClick={()=>{if(window.confirm(`Excluir ${c.name}?`))setConfections(old=>old.filter(x=>x.id!==c.id));}}>Excluir</button></td></tr>)}</tbody></table>{!confections.length&&<p>Nenhuma confecção cadastrada.</p>}</div></section>;
  return <section className="panel"><span className="eyebrow">ADMINISTRAÇÃO</span><h3>Lançamento de vendas</h3><p>Informe o total vendido no mês. O valor é convertido em valor unitário para alimentar os indicadores existentes.</p><form onSubmit={e=>{e.preventDefault();if(!saleCategory||!saleConfection||quantity<=0||saleValue<=0){saved('Preencha todos os campos obrigatórios com valores válidos.');return;}const confection=confections.find(c=>String(c.id)===saleConfection);const date=`${year}-${month}-01`;setSales(old=>[...old,{id:Date.now(),product:`Lançamento mensal · ${confection?.name}`,category:saleCategory,quantity,price:saleValue/quantity,date,city:confection?.city,confection:confection?.name}]);setQuantity(1);setSaleValue(0);saved('Venda registrada neste navegador; os indicadores serão atualizados.');}}><label>Categoria<select required value={saleCategory} onChange={e=>setSaleCategory(e.target.value)}><option value="">Selecione uma categoria</option>{categories.map(c=><option key={c}>{c}</option>)}</select></label><label>Confecção<select required value={saleConfection} onChange={e=>setSaleConfection(e.target.value)}><option value="">Selecione uma confecção</option>{confections.map(c=><option key={c.id} value={c.id}>{c.name} · {c.city}</option>)}</select></label><div className="filters"><label>Mês<select value={month} onChange={e=>setMonth(e.target.value)}>{MONTHS.map((m,i)=><option key={m} value={String(i+1).padStart(2,'0')}>{m}</option>)}</select></label><label>Ano<select value={year} onChange={e=>setYear(e.target.value)}>{periodOptions.map(y=><option key={y}>{y}</option>)}</select></label></div><label>Quantidade vendida<input type="number" min="1" step="1" required value={quantity} onChange={e=>setQuantity(Number(e.target.value))}/></label><label>Valor total da venda (R$)<input type="number" min="0.01" step="0.01" required value={saleValue||''} onChange={e=>setSaleValue(Number(e.target.value))}/></label><p><b>Valor unitário calculado:</b> {money(quantity>0?saleValue/quantity:0)}</p><button>Registrar venda</button></form><p role="status" className="notice">{notice}</p></section>;
}
