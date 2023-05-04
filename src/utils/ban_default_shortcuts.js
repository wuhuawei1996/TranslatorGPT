export default () => {
  document.oncontextmenu = function (event) {
    return false;
  };

  const array = [];
  for (let i = 112; i <= 123; i++) {
    array.push(i);
  }

  window.onkeydown = function (e) {
    // 65:A, 67:C, 86:V, 88:X, 90:Z
    if (
      (e.ctrlKey && [65, 67, 86, 88, 90].indexOf(e.keyCode) === -1) ||
      array.indexOf(e.keyCode) !== -1
    ) {
      e.preventDefault();
      window.event.returnValue = false;
      return false;
    }
  };
};
