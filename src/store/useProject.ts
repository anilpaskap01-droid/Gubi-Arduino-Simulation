import {create} from 'zustand';
import {newProject} from '../utils/project';
import type {Project} from '../types';
interface Store {project:Project;past:Project[];future:Project[];load:(p:Project)=>void;edit:(fn:(p:Project)=>void,history?:boolean)=>void;undo:()=>void;redo:()=>void}
export const useProject=create<Store>((set)=>({project:newProject(),past:[],future:[],load:project=>set({project,past:[],future:[]}),edit:(fn,history=true)=>set(s=>{const p=structuredClone(s.project);fn(p);p.updatedAt=Date.now();return {project:p,past:history?[...s.past.slice(-49),s.project]:s.past,future:history?[]:s.future};}),undo:()=>set(s=>s.past.length?{project:s.past.at(-1)!,past:s.past.slice(0,-1),future:[s.project,...s.future]}:{}),redo:()=>set(s=>s.future.length?{project:s.future[0],past:[...s.past,s.project],future:s.future.slice(1)}:{})}));
