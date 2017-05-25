var storage = chrome.storage.local;
// 初始化 keys
let inited = false

document.addEventListener('DOMContentLoaded', function () {
  loadBasicList()
  document.querySelector('.load').addEventListener('click', function () {
    loadBasicList()
  })
  document.querySelector('main').addEventListener('click', function (e) {
    // window.tmp2 = e.target
    if (e.target.matches('.action') && e.target.textContent === '+-') {
      // 尝试删除
      console.info('删除数据', e.target.parentNode.dataset.id)
      deleteItemById(e.target.parentNode.dataset.id)
    }
    e.stopPropagation()
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


// loadKeys(function (err, result) {
//   if (err) return console.info('keys err')
//   let appId = result.ak;
//   let appKey = result.sk;
//   init = () => { AV.init({ appId, appKey }) }
//   // .then((...x) => console.info(x)).catch(err => console.error(err));
// })

var init = () => {
  return new Promise(function (r, j) {
    // console.info(inited)
    if (inited) {
      r('have inited')
    } else {
      loadKeys(function (err, result) {
        if (err) {
          j('keys error')
        } else {
          let appId = result.ak;
          let appKey = result.sk;
          AV.init({ appId, appKey })
          inited = true
          r('inited')
        }
      })
    }
  }).then(function (result) {
    return result
  }, function (err) {
    return 'error'
  })
}

function loadBasicList() {
  // if (!init) {
  //   return console.info('un loaded')
  // } else {
  //   init()
  // }
  init().then(function (result) {
    console.info(result)
    if (result !== ' error') {
      // 加载列表
      var listEl = document.querySelector('.sider')
      var query = new AV.Query('DailyDone')
      query.find().then(results => {
        // console.info(results)
        window.tmp = results
        renderList(results, '')
      }).catch(err => console.error(err))
    }
  })


}

function renderList(list, selector) {
  selector = selector || 'main ul'
  var target = document.querySelector(selector)
  if (!target) return console.info('无效操作对象')
  var tmpFrag = document.createDocumentFragment()
  // var ul = document.createElement('ul')
  var content = list.map(v => {
    let objId = v.getObjectId()
    if (!objId) return console.info('不预期数据')

    let li = document.createElement('li')
    li.setAttribute('data-id', objId)

    let data = Object.assign({
      url: undefined, title: undefined, catalog: undefined, description: undefined, short: undefined, long: undefined
    }, v.attributes)
    let col = ['catalog', 'title', 'description', 'short', 'long', 'action']
    for (key of col) {
      let tmpSpan = document.createElement('span')
      tmpSpan.className = key
      if (key === 'title') {
        let tmpHref = document.createElement('a')
        tmpHref.setAttribute('href', data.url)
        tmpHref.setAttribute('title', data.url)
        tmpHref.textContent = data[key]
        tmpSpan.appendChild(tmpHref)
      } else {
        tmpSpan.textContent = data[key] || ' - '
      }
      li.appendChild(tmpSpan)
    }
    let supSpan = document.createElement('span')
    supSpan.className = 'action'
    supSpan.textContent = '+-'
    li.appendChild(supSpan)
    //     li.innerHTML = `\
    // <span class='catalog'>${catalog}</span>\
    // <span class='title'><a href='${url}' title='${url}'>${title}</a></span>\
    // <span class='description'>${description}</span>\
    // <span class='short'>${short}</span>\
    // <span class='long'>${long}</span>\
    // <span class='action'>+-</span>\
    //       `
    tmpFrag.appendChild(li)
  })
  target.appendChild(tmpFrag)
}

// new Vue({
//   el:'#app',
//   data:{
//     msg:'aaa message'
//   }
// })


function deleteItemById(id) {

  return false // 暂时不删除，仿制勿删
  var toDel = AV.Object.createWithoutData('DailyDone', id)
  toDel.destroy().then(function (success) {
    console.info('删除成功')
    document.querySelector(`li[data-id='${id}']`).remove()
  }, function (err) {
    console.err('删除失败', err)
  })
}