import { getBBox } from 'diagram-js/lib/util/Elements.js';

import { svgToImage } from '@bpmn-io/svg-to-image';

const PADDING = {
  x: 6,
  y: 6
};

/**
 * @typedef { import('diagram-js/lib/model/index.js').Element} Element
 */


export default class ElementsRenderer {
  constructor(injector, elementRegistry) {
    this._copyPaste = injector.get('copyPaste', false);

    this._elementRegistry = elementRegistry;
  }

  /**
   * Render the closure for the given elements as an image (PNG).
   *
   * @param {Element[]}
   *
   * @returns {Promise<Blob|null>}
   */
  async renderElementClosure(elements) {
    const closure = this._computeClosure(elements);

    return this.renderAsPNG(closure);
  }

  /**
   * @param {Element[]}
   *
   * @return {string[]|Element[]} element closure
   */
  _computeClosure(elements) {

    if (!this._copyPaste) {
      throw new Error('[bpmn-js-copy-as-image] Cannot compute element closer without <copyPaste> service');
    }

    const tree = this._copyPaste.createTree(elements);
    const ids = new Set();

    Object.values(tree || {}).forEach(branch => {
      branch.forEach(descriptor => ids.add(descriptor.id));
    });

    return ids;
  }

  _saveDiagramSVG() {
    const { svg } = this._bpmnjs.saveSVG();

    return svg;
  }


  /**
   * Render passed elements as PNG.
   *
   * @param { string[] | Element[] } elements - elements to render
   *
   * @returns {Promise<Blob>}
   */
  async renderAsPNG(elements) {
    const svg = await this.renderAsSVG(elements);
    return svgToImage(svg, { imageType: 'png', outputFormat: 'blob' });
  }

  async renderAsSVG(elements) {
    if (!Array.isArray(elements)) {
      elements = [ elements ];
    }

    // gather elements ids
    const ids = elements.map(element => {
      if (typeof element !== 'string') {
        return element.id;
      }

      return element;
    });

    // save the diagram as svg and parse document
    const svg = await this._saveDiagramSVG();
    const svgDoc = new DOMParser().parseFromString(svg, 'image/svg+xml');

    // remove visuals of elements we don't want to render
    const gfx = svgDoc.querySelectorAll('svg > .djs-group [data-element-id]');
    gfx.forEach(element => {
      if (!ids.includes(element.dataset.elementId)) {
        element.querySelector('.djs-visual').remove();
      }
    });

    // adjust svg viewbox with padding to account for arrow markers
    const bbox = this._getBBox(elements);
    const paddedWidth = bbox.width + PADDING.x * 2;
    const paddedHeight = bbox.height + PADDING.y * 2;

    svgDoc.documentElement.setAttribute('viewBox',
      `${bbox.x - PADDING.x} ${bbox.y - PADDING.y} ${paddedWidth} ${paddedHeight}`);
    svgDoc.documentElement.setAttribute('width', `${Math.max(1, Math.ceil(paddedWidth))}`);
    svgDoc.documentElement.setAttribute('height', `${Math.max(1, Math.ceil(paddedHeight))}`);

    const serialized = new XMLSerializer().serializeToString(svgDoc);

    return serialized;
  }

  _getBBox(elementsOrIds) {
    const elements = elementsOrIds.map(elementOrId => {
      if (typeof elementOrId !== 'string') {
        return elementOrId;
      }

      return this._elementRegistry.get(elementOrId);
    });

    return getBBox(elements);
  }
}

ElementsRenderer.$inject = [ 'injector', 'elementRegistry' ];
