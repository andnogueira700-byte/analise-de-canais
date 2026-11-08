import React from 'react';
import {Composition} from 'remotion';
import {Video, TOTAL_FRAMES} from './Video';
import {Sheet} from './Sheet';
export const Root: React.FC = () => (
  <>
    <Composition id="Orche" component={Video} durationInFrames={TOTAL_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Sheet" component={Sheet} durationInFrames={90} fps={30} width={1920} height={1080} />
  </>
);
