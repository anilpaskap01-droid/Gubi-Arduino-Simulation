import {useLayoutEffect,useMemo,useRef,useState} from 'react';
import {Plus,Search} from 'lucide-react';
import {registry} from './registry';
import {PartVisual} from '../circuit/PartVisual';
import type {ComponentDefinition,Support} from '../types';

export const normalizeSearch=(s:string)=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replaceAll('ı','i');
const aliases:Record<string,string>={ekran:'display',sensor:'sensors',sensorler:'sensors',matris:'matrix',guc:'power',pil:'battery',dugme:'button',baglanti:'connectors',entegre:'ic'};
export function filterComponents(parts:ComponentDefinition[],query:string,category:string,support:string){
 const terms=normalizeSearch(query).trim().split(/\s+/).filter(Boolean).map(t=>aliases[t]||t);
 return parts.filter(d=>{
  const search=normalizeSearch([d.name,d.id,d.category,d.description,...d.tags||[]].join(' '));
  return (category==='All components'||d.category===category)&&(support==='All levels'||d.supportLevel===support)&&terms.every(t=>search.includes(t));
 });
}
const categories=[...new Set(registry.map(d=>d.category))];
const overscan=4;
export function ComponentLibrary({add}:{add:(id:string)=>void}){
 const [query,setQuery]=useState(''),[category,setCategory]=useState('All components'),[support,setSupport]=useState<Support|'All levels'>('All levels');
 const viewport=useRef<HTMLDivElement>(null),[scrollTop,setScrollTop]=useState(0),[height,setHeight]=useState(500),[rowHeight,setRowHeight]=useState(72);
 const filtered=useMemo(()=>filterComponents(registry,query,category,support),[query,category,support]);
 useLayoutEffect(()=>{const el=viewport.current;if(!el)return;const observer=new ResizeObserver(()=>{setHeight(el.clientHeight);setRowHeight(window.matchMedia('(max-width:600px)').matches?116:72);});observer.observe(el);return()=>observer.disconnect();},[]);
 useLayoutEffect(()=>{setScrollTop(0);if(viewport.current)viewport.current.scrollTop=0;},[query,category,support]);
 const start=Math.max(0,Math.min(filtered.length-1,Math.floor(scrollTop/rowHeight)-overscan));
 const end=Math.min(filtered.length,start+Math.ceil(height/rowHeight)+overscan*2);
 return <aside className="library">
  <div className="panel-header">Component library <span>{registry.length}</span></div>
  <label className="search"><Search size={15}/><input aria-label="Search components" placeholder="Name, type or interface…" value={query} onChange={e=>setQuery(e.target.value)}/></label>
  <select aria-label="Category" value={category} onChange={e=>setCategory(e.target.value)}><option>All components</option>{categories.map(c=><option key={c} value={c}>{c} ({registry.filter(d=>d.category===c).length})</option>)}</select>
  <select aria-label="Simulation support" value={support} onChange={e=>setSupport(e.target.value as Support|'All levels')}>{['All levels','Full','Partial','Experimental'].map(level=><option key={level}>{level}</option>)}</select>
  <div className="library-results" aria-live="polite">{filtered.length} matching parts</div>
  <div className="library-scroll" ref={viewport} onScroll={e=>setScrollTop(e.currentTarget.scrollTop)}>
   {filtered.length?<div className="library-rows" style={{height:filtered.length*rowHeight}}>{filtered.slice(start,end).map((d,i)=><button key={d.id} className="library-part" title={`${d.name} · ${d.supportLevel} · ${d.pins.length} pins`} style={{position:'absolute',top:(start+i)*rowHeight,height:rowHeight}} onClick={()=>add(d.id)} draggable onDragStart={e=>e.dataTransfer.setData('gubi/component',d.id)}>
    <div className="library-thumbnail"><PartVisual part={{id:'preview',type:d.id,position:{x:0,y:0},rotation:0,properties:d.defaultProperties}}/></div><div><strong>{d.name}</strong><small className={d.supportLevel.toLowerCase()}>{d.supportLevel} · {d.pins.length} pins</small></div><Plus size={13}/>
   </button>)}</div>:<p className="library-empty">No matching parts. Try another name or clear the filters.</p>}
  </div><div className="library-foot">Click to add · drag onto canvas</div>
 </aside>;
}
