import { expect } from 'chai';
import { stub as sinonStub } from 'sinon';

import BpmnModeler from 'bpmn-js/lib/Modeler.js';

import sampleDiagram from './sample.bpmn';

import {
  insertCSS
} from '../helper/index.js';

import fileDrop from 'file-drops';
import fileOpen from 'file-open';
import download from 'downloadjs';

import fileDropCSS from './file-drops.css';

import diagramCSS from 'bpmn-js/dist/assets/diagram-js.css';
import bpmnCSS from 'bpmn-js/dist/assets/bpmn-js.css';
import bpmnFontCSS from 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';

import { CopyAsImageModule } from '../../src/index.js';


insertCSS('file-drops.css', fileDropCSS);

insertCSS('diagram-js.css', diagramCSS);
insertCSS('bpmn-font.css', bpmnFontCSS);
insertCSS('bpmn-js.css', bpmnCSS);

const singleStart = window.__env__ && window.__env__.SINGLE_START === 'BPMN';


describe('copy-as-image', function() {

  let modeler;

  let writeClipboardStub;

  beforeEach(async function() {

    if (modeler) {
      modeler.destroy();
    }

    const container = testContainer();
    modeler = new BpmnModeler({
      container,
      additionalModules: [
        CopyAsImageModule
      ]
    });

    writeClipboardStub = sinonStub(navigator.clipboard, 'write');

    await modeler.importXML(sampleDiagram);
  });

  afterEach(function() {
    writeClipboardStub.restore();
  });

  (singleStart ? it.only : it)('should open', async function() {
    setupApp(modeler, 'sample.bpmn');
  });


  it('should render selection as PNG', async function() {

    // given
    const selection = modeler.get('selection');
    const elementRegistry = modeler.get('elementRegistry');
    const elementsRenderer = modeler.get('elementsRenderer');

    selection.select([
      elementRegistry.get('SCAN_QR_CODE'),
      elementRegistry.get('SCAN_OK'),
      elementRegistry.get('sid-EE8A7BA0-5D66-4F8B-80E3-CC2751B3856A')
    ]);

    // when
    const png = await elementsRenderer.renderSelectionAsPNG();

    // then
    expect(png).to.be.instanceof(Blob);
    expect(png.type).to.equal('image/png');
  });


  it('should render elements as SVG', async function() {

    // given
    const elementRegistry = modeler.get('elementRegistry');
    const elementsRenderer = modeler.get('elementsRenderer');

    // when
    const svg = await elementsRenderer.renderAsSVG([
      elementRegistry.get('SCAN_QR_CODE'),
      elementRegistry.get('SCAN_OK'),
      elementRegistry.get('sid-EE8A7BA0-5D66-4F8B-80E3-CC2751B3856A')
    ]);

    // then
    expect(svg).to.be.a('string');
    expect(svg).to.contain('<svg');
    expect(svg).to.contain('viewBox');
  });


  it('should render elements as PNG', async function() {

    // given
    const elementRegistry = modeler.get('elementRegistry');
    const elementsRenderer = modeler.get('elementsRenderer');

    // when
    const png = await elementsRenderer.renderAsPNG([
      elementRegistry.get('SCAN_QR_CODE'),
      elementRegistry.get('SCAN_OK'),
      elementRegistry.get('sid-EE8A7BA0-5D66-4F8B-80E3-CC2751B3856A')
    ]);

    // then
    expect(png).to.be.instanceof(Blob);
    expect(png.type).to.equal('image/png');
  });


  describe('keyboard shortcuts', function() {

    it('should copy selection via <Cmd/Ctrl+Shift+C>', async function() {

      // given
      const clipboardWritten = defer();

      writeClipboardStub.callsFake((...args) => {
        clipboardWritten.resolve(...args);
      });

      // given
      const selection = modeler.get('selection');
      const elementRegistry = modeler.get('elementRegistry');
      const keyboard = modeler.get('keyboard');

      selection.select([
        elementRegistry.get('SCAN_QR_CODE'),
        elementRegistry.get('SCAN_OK'),
        elementRegistry.get('sid-EE8A7BA0-5D66-4F8B-80E3-CC2751B3856A')
      ]);

      const target = keyboard.getBinding();
      const event = new KeyboardEvent('keydown', {
        key: 'c',
        code: 'KeyC',
        ctrlKey: true,
        shiftKey: true,
        bubbles: true,
        cancelable: true
      });

      // when
      target.dispatchEvent(event);

      // then
      const clipboardItems = await clipboardWritten.promise;

      expect(writeClipboardStub).to.have.been.calledOnce;
      expect(clipboardItems).to.have.length(1);
      expect(clipboardItems[0].types).to.eql([ 'image/png' ]);
    });

  });


  describe('editor actions', function() {

    it('should copy selection when "copySelectionAsImage" action is triggered', async function() {

      // given
      const clipboardWritten = defer();

      writeClipboardStub.callsFake((...args) => {
        clipboardWritten.resolve(...args);
      });

      const selection = modeler.get('selection');
      const elementRegistry = modeler.get('elementRegistry');
      const editorActions = modeler.get('editorActions');

      selection.select([
        elementRegistry.get('SCAN_QR_CODE'),
        elementRegistry.get('SCAN_OK'),
        elementRegistry.get('sid-EE8A7BA0-5D66-4F8B-80E3-CC2751B3856A')
      ]);

      // when
      const result = await editorActions.trigger('copySelectionAsImage');

      // then
      expect(result).to.be.instanceof(Blob);
      expect(result.type).to.equal('image/png');

      const clipboardItems = await clipboardWritten.promise;

      expect(writeClipboardStub).to.have.been.calledOnce;
      expect(clipboardItems).to.have.length(1);
      expect(clipboardItems[0].types).to.eql([ 'image/png' ]);
    });
  });
});


// helpers //////////////////////////

function setupApp(modeler, fileName) {

  function openDiagram(diagram) {
    return modeler.importXML(diagram)
      .then(({ warnings }) => {
        if (warnings.length) {
          console.warn(warnings);
        }
      })
      .catch(err => {
        console.error(err);
      });
  }

  function openFile(files) {

    // files = [ { name, contents }, ... ]

    if (!files.length) {
      return;
    }

    fileName = files[0].name;

    openDiagram(files[0].contents);
  }

  function downloadDiagram() {
    modeler.saveXML({ format: true }, function(err, xml) {
      if (!err) {
        download(xml, fileName, 'application/xml');
      }
    });
  }

  const handleDragOver = fileDrop('Open BPMN diagram', openFile);

  const handleKeys = (event) => {
    if (event.code === 'KeyS' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();

      downloadDiagram();
    }

    if (event.code === 'KeyO' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();

      fileOpen().then(openFile);
    }
  };

  document.body.addEventListener('keydown', handleKeys);
  document.body.addEventListener('dragover', handleDragOver);

  return () => {
    document.body.removeEventListener('keydown', handleKeys);
    document.body.removeEventListener('dragover', handleDragOver);
  };
}

/**
 * Create a full-screen test container.
 *
 * @return {Element}
 */
function testContainer() {
  var el = document.createElement('div');

  el.style.width = '100%';
  el.style.height = '100vh';
  el.style.margin = '-10px';
  el.style.position = 'absolute';

  document.body.appendChild(el);

  return el;
}

function defer() {

  let reject;
  let resolve;

  const promise = new Promise((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });

  return {
    promise,
    resolve: (...args) => {
      resolve(...args);
    },
    reject: (...args) => {
      reject(...args);
    }
  };
}