const HIGH_PRIORITY = 1500;

const KEY_C = [ 'c', 'C', 'KeyC' ];

export default class CopyAsImageKeyboardBindings {
  constructor(keyboard, editorActions) {
    this._editorActions = editorActions;

    keyboard.addListener(HIGH_PRIORITY, event => {
      const keyEvent = event.keyEvent;

      if (keyboard.isCmd(keyEvent) && keyboard.isShift(keyEvent) && keyboard.isKey(KEY_C, keyEvent)) {
        this._copySelectionAsImage().catch(error => {
          console.error('[bpmn-js-copy-as-image] Failed to copy ', error);
        });
        return true;
      }
    });
  }

  async _copySelectionAsImage() {
    await this._editorActions.trigger('copySelectionAsImage');
  }
}

CopyAsImageKeyboardBindings.$inject = [ 'keyboard', 'editorActions' ];
