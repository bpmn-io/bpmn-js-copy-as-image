import { Canvg } from 'canvg';
import { getBBox } from 'diagram-js/lib/util/Elements';

const PADDING = {
  x: 6,
  y: 6
};

export class ElementsRenderer {
  constructor(bpmnjs, elementRegistry) {
    this._bpmnjs = bpmnjs;
  }

  /**
   * Render passed elements as PNG.
   *
   * @param {Array<string|object>} elements - elements to render
   * @returns {Promise<Blob>}
   */
  async renderAsPNG(elements) {
    const svg = await this.renderAsSVG(elements);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const canvg = Canvg.fromString(ctx, svg);

    await canvg.render();

    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const png = await new Promise(resolve => {
      canvas.toBlob(blob => resolve(blob), 'image/png');
    });

    return png;
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
    const { svg } = await this._bpmnjs.saveSVG();
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
    svgDoc.documentElement.setAttribute('viewBox',
      `${bbox.x - PADDING.x} ${bbox.y - PADDING.y} ${bbox.width + PADDING.x * 2} ${bbox.height + PADDING.y * 2}`);

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

ElementsRenderer.$inject = [ 'bpmnjs' ];
