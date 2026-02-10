export default function CopyAsImageEditorActions(editorActions, elementsRenderer) {
  editorActions.register('copySelectionAsImage', async function() {
    const png = await elementsRenderer.renderSelectionAsPNG();

    if (!png) {
      return null;
    }

    await navigator.clipboard.write([
      new ClipboardItem({
        'image/png': png
      })
    ]);

    return png;
  });
}

CopyAsImageEditorActions.$inject = [ 'editorActions', 'elementsRenderer' ];
