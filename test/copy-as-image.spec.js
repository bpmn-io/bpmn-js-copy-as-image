import BpmnModeler from 'bpmn-js/lib/Modeler';

import sampleDiagram from './sample.bpmn';

import {
  insertCSS
} from './helper';

import fileDrop from 'file-drops';
import fileOpen from 'file-open';
import download from 'downloadjs';

import fileDropCSS from './file-drops.css';

import diagramCSS from 'bpmn-js/dist/assets/diagram-js.css';
import bpmnCSS from 'bpmn-js/dist/assets/bpmn-js.css';
import bpmnFontCSS from 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';

import { CopyAsImageModule } from '../src';


insertCSS('file-drops.css', fileDropCSS);

insertCSS('diagram-js.css', diagramCSS);
insertCSS('bpmn-font.css', bpmnFontCSS);
insertCSS('bpmn-js.css', bpmnCSS);


describe('copy-as-image', function() {

  it('should open', async function() {

    const modeler = new BpmnModeler({
      container: testContainer(),
      additionalModules: [
        CopyAsImageModule
      ]
    });

    await modeler.importXML(sampleDiagram);

    // with app like behavior
    setupApp(modeler, 'sample.bpmn');
  });

});


/////////////// helpers //////////////////////////

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