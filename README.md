# bpmn-js-copy-as-image

[![CI](https://github.com/barmac/bpmn-js-copy-as-image/actions/workflows/CI.yml/badge.svg)](https://github.com/barmac/bpmn-js-copy-as-image/actions/workflows/CI.yml)

This project extends your [bpmn-js](https://github.com/bpmn-io/bpmn-js) editor to copy the current canvas selection as an image, or generate a PNG/SVG from a list of eleemnts.

![pasted screenshot](./resources/screenshot.png)

## Features

* generate SVG or PNG from a selection of diagram elements
* copy to [system clipboard](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API)
  * triggered via `CtrlOrCmd + Shift + C` keyboard shortcut
  * triggered via `copySelectionAsImage` editor action

## Usage

Depending on you use-case, include different parts of this project into your favorite [BPMN editor](https://github.com/bpmn-io/bpmn-js).

### Basic

To enable the keyboard shortcut and/or register the editor action, import `CopyAsImageModule`:

```javascript
import BpmnModeler from 'bpmn-js/lib/Modeler';
import { CopyAsImageModule } from 'bpmn-js-copy-as-image';

const modeler = new BpmnModeler({
  container: '#container',
  additionalModules: [
    CopyAsImageModule
  ]
});

await modeler.importXML(/* ... */);
```

### Programmatic use

If you want the programmatic API, import `ElementsRendererModule`:

```javascript
import BpmnModeler from 'bpmn-js/lib/Modeler';
import { ElementsRendererModule } from 'bpmn-js-copy-as-image';

const modeler = new BpmnModeler({
  container: '#container',
  additionalModules: [
    ElementsRendererModule
  ]
});

await modeler.importXML(/* ... */);

const elementsRenderer = modeler.get('elementsRenderer');
const png = await elementsRenderer.renderAsPNG([ 'Task_1' ]);
```

## Build and Run

```
# install dependencies
npm install

# run project, executing all tasks
npm run all

# start demo, in browser
npm start
```

## Credits

The project was built on top of @nikku's [native copy and paste example](https://github.com/nikku/bpmn-js-native-copy-paste).

## License

MIT
