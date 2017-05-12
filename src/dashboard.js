var storage = chrome.storage.local;
// 初始化 keys
let init = null
loadKeys(function (err, result) {
  if (err) return console.info('keys err')
  let appId = result.ak;
  let appKey = result.sk;
  init = () => { AV.init({ appId, appKey }) }
  // .then((...x) => console.info(x)).catch(err => console.error(err));
})


document.addEventListener('DOMContentLoaded', function () {
  loadBasicList()
  document.querySelector('.load').addEventListener('click', function () {
    loadBasicList()
  })
})
/**
 * 加载 appId 和 appKey
 * @param  {} cb - 回掉函数
 */
function loadKeys(cb) {
  let ak, sk
  Promise.resolve().then(() => new Promise(function (resolve, reject) {
    storage.get('ak', function (items) {
      items.ak ? resolve(items.ak) : reject('no ak')
    })
  })
  ).then((ak) => new Promise(function (resolve, reject) {
    storage.get('sk', function (items) {
      items.sk ? resolve({ ak, sk: items.sk }) : reject('has ak, but no sk')
    })
  })).then(function (result) {
    cb(null, result)
  }).catch(function (err) {
    console.error(err)
    cb(err)
  })
}


function loadBasicList() {
  if (typeof init !== 'function') { 
    return console.info('un loaded') 
  } else {
    init()
  }
  // 加载列表
  var listEl = document.querySelector('.sider')
  var query = new AV.Query('DailyDone')
  query.find().then(results => {
    // console.info(results)
    window.tmp = results
  }).catch(err => console.error(err))
}

function renderList(){

}
