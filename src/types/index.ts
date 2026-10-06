export type Support='Full'|'Partial'|'Experimental';
export interface Pin {id:string;type:'digital'|'analog'|'power'|'ground'|'passive'}
export interface ComponentDefinition {id:string;name:string;category:string;description:string;pins:Pin[];visual:string;defaultProperties:Record<string,string|number|boolean>;simulationHandler:string;interactiveControls:string[];documentation:string;supportLevel:Support}
export interface Part {id:string;type:string;position:{x:number;y:number};rotation:number;properties:Record<string,string|number|boolean>}
export interface Wire {id:string;source:string;target:string;sourceHandle:string;targetHandle:string;color:string}
export interface Project {version:1;id:string;name:string;board:string;code:string;components:Part[];wires:Wire[];simulatorSettings:{frequency:number};updatedAt:number}
export interface Snapshot {time:number;pins:Record<string,number>;states:Record<string,{brightness?:number;angle?:number;color?:string}>;serial:string;warnings:string[]}
