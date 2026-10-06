import 'monaco-editor/esm/vs/basic-languages/cpp/cpp.contribution';
import Editor,{loader} from '@monaco-editor/react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import {useProject} from '../store/useProject';
(globalThis as any).MonacoEnvironment={getWorker:()=>new EditorWorker()};loader.config({monaco});
export function CodeEditor(){const {project,edit}=useProject();return <div className="code-wrap"><div className="panel-header">sketch.ino <span>Arduino C++ · AVR GCC</span></div><Editor height="100%" language="cpp" theme="vs-dark" value={project.code} onChange={v=>edit(p=>{p.code=v||'';})} options={{fontSize:13,fontFamily:'Consolas, monospace',minimap:{enabled:false},scrollBeyondLastLine:false,automaticLayout:true,padding:{top:18},tabSize:2}}/></div>;}
