import {openDB} from 'idb';
import type {Project} from '../types';
const db=()=>openDB('gubi-projects',1,{upgrade(d){d.createObjectStore('projects',{keyPath:'id'});}});
export const saveProject=async(p:Project)=>(await db()).put('projects',{...p,updatedAt:Date.now()});
export const listProjects=async():Promise<Project[]>=>{return (await (await db()).getAll('projects')).sort((a,b)=>b.updatedAt-a.updatedAt);};
export const deleteProject=async(id:string)=>(await db()).delete('projects',id);
