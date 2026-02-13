import ElementsRenderer from './ElementsRenderer.js';
import CopyAsImageContextPadProvider from './CopyAsImageContextPadProvider.js';
import CopyAsImageKeyboardBindings from './CopyAsImageKeyboardBindings.js';
import CopyAsImageEditorActions from './CopyAsImageEditorActions.js';

export { default as generateImageFromSvg } from './util/generateImageFromSvg.js';


export const ElementsRendererModule = {
  elementsRenderer: [ 'type', ElementsRenderer ]
};

export const CopyAsImageModule = {
  __depends__: [ ElementsRendererModule ],
  __init__: [
    'copyAsImageEditorActions',
    'copyAsImageKeyboardBindings'
  ],
  copyAsImageEditorActions: [ 'type', CopyAsImageEditorActions ],
  copyAsImageKeyboardBindings: [ 'type', CopyAsImageKeyboardBindings ]
};

export const CopyAsImageContextPadModule = {
  __depends__: [ ElementsRendererModule ],
  __init__: [ 'copyAsImageContextPadProvider' ],
  copyAsImageContextPadProvider: [ 'type', CopyAsImageContextPadProvider ],
};

export const CopyAsImageEditorActionsModule = {
  __depends__: [ ElementsRendererModule ],
  __init__: [ 'copyAsImageEditorActions' ],
  copyAsImageEditorActions: [ 'type', CopyAsImageEditorActions ]
};