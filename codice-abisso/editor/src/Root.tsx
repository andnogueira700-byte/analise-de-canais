import React from 'react';
import {Composition} from 'remotion';
import {Sheet} from './Sheet';
export const Root: React.FC = () => (
  <>
    <Composition id="Sheet" component={Sheet} durationInFrames={90} fps={30} width={1920} height={1080} />
  </>
);
