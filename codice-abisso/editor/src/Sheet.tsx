import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import './fonts';
import {Animal, AnimalKind, Human} from './animals';
import {SceneCtx, Background} from './fx';
export const Sheet: React.FC = () => {
  const f = useCurrentFrame();
  const ks: AnimalKind[] = ['orca','sperm','humpback','pilot','shark','seal','blue','dolphin','fish','greywhale'];
  return (
    <SceneCtx.Provider value={{lt: f/30, dur: 5, idx: 0, gt: f/30}}>
    <AbsoluteFill style={{background:'#0A0A0A'}}>
      <Background />
      {ks.map((k,i)=>(<div key={k} style={{position:'absolute', left: (i%2)*960+30, top: Math.floor(i/2)*215+10}}><Animal kind={k} t={f/30} w={440} glow={k==='orca'} /></div>))}
      <div style={{position:'absolute', left: 900, top: 20}}><Human h={200}/></div>
    </AbsoluteFill>
    </SceneCtx.Provider>
  );
};
