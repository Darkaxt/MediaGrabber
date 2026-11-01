/* Run in a disposable real-browser page after loading the production MSE bundle. */
window.runMediaGrabberXhrRegression = async function () {
  const assert = (condition, description) => { if (!condition) throw new Error(description); };
  const observed = [];
  const xhr = new XMLHttpRequest();
  let propertyLoads = 0;
  let propertyEnds = 0;
  let readyStates = [];
  let replacedLoads = 0;
  function onload(event) {
    assert(this === xhr && event.target === xhr && event.type === 'load', 'native callback receiver/Event changed');
    propertyLoads++;
  }
  xhr.onload = () => { replacedLoads++; };
  xhr.onload = onload;
  const identityPreserved = xhr.onload === onload;
  xhr.onreadystatechange = function (event) {
    assert(this === xhr && event.target === xhr, 'readystatechange receiver/Event changed');
    readyStates.push(xhr.readyState);
  };
  xhr.onloadend = () => { propertyEnds++; };
  async function request(value) {
    await new Promise(resolve => {
      xhr.addEventListener('loadend', () => { observed.push(xhr.responseText); resolve(); }, {once:true});
      xhr.open('GET', 'data:text/plain,' + value);
      xhr.send();
    });
  }
  await request('first');
  await request('second');
  const result = {identityPreserved, propertyLoads, propertyEnds, readyStates, replacedLoads, observed};
  // Report completed native dispatch even when the old hook suppressed property callbacks.
  window.mediaGrabberXhrRegressionResult = result;
  assert(identityPreserved, 'onload getter no longer returns the assigned handler');
  assert(propertyLoads === 2 && propertyEnds === 2 && replacedLoads === 0, 'native property completion callbacks suppressed or replaced');
  assert(readyStates.includes(1) && readyStates.filter(state => state === 4).length === 2, 'native readystatechange callbacks suppressed');
  assert(observed.join(',') === 'first,second', 'reused XHR response/listener behavior changed');
  xhr.onload = null;
  xhr.onreadystatechange = null;
  xhr.onloadend = null;
  await request('cleared');
  assert(propertyLoads === 2 && propertyEnds === 2 && xhr.onload === null, 'cleared handler still invoked');
  return result;
};

