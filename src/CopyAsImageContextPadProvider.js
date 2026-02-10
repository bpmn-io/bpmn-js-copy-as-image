export default class CopyAsImageContextPadProvider {
  constructor(elementsRenderer, contextPad) {
    this._elementsRenderer = elementsRenderer;
    this._contextPad = contextPad;

    contextPad.registerProvider(this);
  }

  getContextPadEntries(element) {
    return this._getEntries(element);
  }

  getMultiElementContextPadEntries(elements) {
    return this._getEntries(elements);
  }

  _getEntries(elementOrElements) {
    const elementsRenderer = this._elementsRenderer;
    const contextPad = this._contextPad;

    return {
      'copy-as-png': {
        title: 'Copy as PNG',
        imageUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' height='30' width='30'%3E%3Ctext x='0' y='15'%3EPNG%3C/text%3E%3C/svg%3E",
        action: {
          async click() {
            const png = await elementsRenderer.renderAsPNG(elementOrElements);

            await navigator.clipboard.write([
              new ClipboardItem({
                'image/png': png
              })
            ]);

            contextPad.close();
          }
        }
      }
    };
  }
}

CopyAsImageContextPadProvider.$inject = [ 'elementsRenderer', 'contextPad' ];
