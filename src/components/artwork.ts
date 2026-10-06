import type {ComponentDefinition} from '../types';

const assets=import.meta.glob<string>('../assets/components/catalog/*.svg',{
 eager:true,import:'default',query:'?url&no-inline',
});

export function componentArtwork(definition:ComponentDefinition,animatedBase=false):string{
 const url=assets[`../assets/components/catalog/${definition.id}${animatedBase?'-base':''}.svg`];
 if(!url)throw new Error(`Missing SVG model for ${definition.name}`);
 return url;
}
