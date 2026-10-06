import {definitions} from '../components/registry';
import board from '../assets/components/board.svg';
import servo from '../assets/components/servo.svg';
import module from '../assets/components/module.svg';
import type {Part,Snapshot} from '../types';
export function PartVisual({part,state}:{part:Part;state?:Snapshot['states'][string]}){const d=definitions[part.type],lit=state?.brightness||0;
 if(d.visual==='board')return <div className="board-visual"><img src={board}/><span className="board-led" style={{background:lit>0?'#8cda91':'#304936'}}/></div>;
 if(d.visual==='servo')return <div className="servo-visual"><img src={servo}/><svg viewBox="0 0 150 120"><g transform={`rotate(${(state?.angle??90)-90} 75 40)`}><rect x="69" y="7" width="12" height="62" rx="6" fill="#e8e8df" stroke="#a9aca5"/><circle cx="75" cy="40" r="4" fill="#778080"/></g></svg><span>{Math.round(state?.angle??90)}°</span></div>;
 if(d.visual==='led'||d.visual==='rgb')return <svg viewBox="0 0 120 105"><path d="M49 68V100 M70 68V100" stroke="#a7b1b8" strokeWidth="4"/><path d="M35 61V38a25 25 0 0 1 50 0v23Z" fill={state?.color||String(part.properties.color||'red')} opacity={.3+lit*.7} stroke="#b7bcc3" strokeWidth="2" style={{filter:lit>0?`drop-shadow(0 0 ${10*lit}px ${state?.color||part.properties.color||'red'})`:undefined}}/><rect x="31" y="60" width="58" height="9" rx="3" fill={state?.color||String(part.properties.color||'red')} opacity={.5+lit*.5}/><path d="M44 32Q44 22 53 20" stroke="#ffffff88" strokeWidth="4" fill="none"/></svg>;
 if(d.visual==='resistor')return <svg viewBox="0 0 140 80"><path d="M4 40H136" stroke="#abb7bb" strokeWidth="3"/><rect x="30" y="25" width="80" height="30" rx="8" fill="#c4ad83" stroke="#ddc9a9"/><path d="M43 25V55 M58 25V55 M77 25V55 M96 25V55" stroke="#915246" strokeWidth="6"/><text x="70" y="75" textAnchor="middle" fill="#a3adb9" fontSize="10">{part.properties.value} Ω</text></svg>;
 if(d.visual==='button')return <svg viewBox="0 0 120 90"><path d="M10 24H110 M10 66H110" stroke="#b3b8b6" strokeWidth="5"/><rect x="23" y="10" width="74" height="70" rx="6" fill="#8f999e"/><rect x="27" y="14" width="66" height="62" rx="5" fill="#25303a"/><circle cx="60" cy="45" r="24" fill={part.properties.pressed?'#72b498':'#465460'} stroke="#a4aab0" strokeWidth="2"/></svg>;
 if(d.visual==='pot')return <svg viewBox="0 0 120 100"><rect x="20" y="20" width="80" height="63" rx="8" fill="#356c91" stroke="#6f99b2"/><circle cx="60" cy="50" r="27" fill="#b8bdba" stroke="#d8ddd7"/><g transform={`rotate(${Number(part.properties.value)/1023*270-135} 60 50)`}><path d="M60 50V27" stroke="#354b50" strokeWidth="5"/></g></svg>;
 return <img src={module} alt=""/>;
}
