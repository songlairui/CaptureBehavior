var storage = chrome.storage.local

document.addEventListener('DOMContentLoaded', function () {
  loadKeys()

  document.querySelector('.save').addEventListener('click', function () {
    // console.info(inputAk)
    saveKeys()
  })
  document.querySelector('.test').addEventListener('click', function () {
    // console.info(inputAk)
    testKeys()
  })
  document.querySelector('.clear').addEventListener('click', function () {
    // console.info(inputAk)
    clearSK()
  })
})

function getTarget() {
  var inputAk = document.querySelector('#ak')
  var inputSk = document.querySelector('#sk')
  return { inputAk, inputSk }
}

function loadKeys() {
  var { inputAk, inputSk } = getTarget()
  storage.get('ak', items => {
    if (items.ak) {
      inputAk.value = items.ak
    }
  })
  storage.get('sk', items => {
    if (items.sk) {
      inputSk.value = items.sk
    }
  })
}

function saveKeys() {
  var { inputAk, inputSk } = getTarget()
  // console.info(inputAk,inputSk)
  var ak = inputAk.value
  var sk = inputSk.value
  if (!ak || !sk) {
    console.info('Error: none key');
    return;
  }
  storage.set({ ak, sk }, function () {
    console.info('storaged')
  })
}

function testKeys() {
  var { inputAk, inputSk } = getTarget()
  var tip = document.querySelector('.tip')
  console.info(inputAk.value, inputSk.value)
  const appId = inputAk.value;
  const appKey = inputSk.value;
  AV.init({ appId, appKey });

  var TestObject = AV.Object.extend('TestObject');
  var testObject = new TestObject();
  testObject.save({
    words: 'Hello World!'
  }).then(function (object) {
    console.info('ok!')
    saveKeys()
    tip.textContent = `OK`
  }).catch(function (err) {
    console.log(err.message)
    console.info('请检查 appId 、 appKey 是否正确')
    tip.textContent = `${err.message} 请检查 appId 、 appKey 是否正确`
  });
}

function clearSK() {
  // 清空appKey
  storage.remove('sk', function () {
    console.info('sk removed')
    loadKeys()
  })
}