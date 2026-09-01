(function (MockApp) {
  var deepClone = MockApp.utils.deepClone;
  var limit = MockApp.app.constants.HISTORY_LIMIT;

  function createHistory(initialState) {
    return {
      past: [],
      present: deepClone(initialState),
      future: []
    };
  }

  function push(history, nextState) {
    history.past.push(deepClone(history.present));
    if (history.past.length > limit) {
      history.past.shift();
    }
    history.present = deepClone(nextState);
    history.future = [];
    return history;
  }

  function canUndo(history) {
    return history.past.length > 0;
  }

  function canRedo(history) {
    return history.future.length > 0;
  }

  function undo(history) {
    if (!canUndo(history)) {
      return null;
    }

    history.future.unshift(deepClone(history.present));
    history.present = history.past.pop();
    return deepClone(history.present);
  }

  function redo(history) {
    if (!canRedo(history)) {
      return null;
    }

    history.past.push(deepClone(history.present));
    history.present = history.future.shift();
    return deepClone(history.present);
  }

  MockApp.history.manager = {
    createHistory: createHistory,
    push: push,
    undo: undo,
    redo: redo,
    canUndo: canUndo,
    canRedo: canRedo
  };
})(window.MockApp);
