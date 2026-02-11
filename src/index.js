import { ElementsRenderer } from './ElementsRenderer.js';
import { CopyAsImageContextPadProvider } from './CopyAsImageContextPadProvider.js';


export const ElementsRendererModule = {
  elementsRenderer: [ 'type', ElementsRenderer ]
};

export const CopyAsImageModule = {
  __depends__: [ ElementsRendererModule ],
  __init__: [ 'copyAsImageContextPadProvider' ],
  copyAsImageContextPadProvider: [ 'type', CopyAsImageContextPadProvider ],
};
