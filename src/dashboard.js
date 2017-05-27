var storage = chrome.storage.local;
let dataStore = new Map()
let renderedItem = new Map()
  // 初始化 keys
let inited = false
window.addEventListener('resize', function() {
  console.info('resize')
  let target = document.querySelector('.detail header')
  let html0 = document.documentElement
  let html1 = document.querySelector('html')
  let body = document.querySelector('body')
  let t1 = document.querySelector('.detail')
  let t2 = document.querySelector('.dashboard')
  target.textContent = `
    ${html0.clientWidth}
    ${html1.clientWidth}
    ${body.clientWidth}
    ${t1.clientWidth}
    ${t2.clientWidth}
  `
})
document.body.addEventListener('click', function() {
  if (document.body.classList.contains('focus')) {
    document.body.classList.remove('focus')
  } else {
    document.body.classList.add('focus')
  }
})
document.addEventListener('DOMContentLoaded', function() {
  loadBasicList()
  document.querySelector('.load').addEventListener('click', function() {
    loadBasicList()
  })
  document.querySelector('main').addEventListener('click', function(e) {
    // window.tmp2 = e.target
    if (e.target.matches('a')) {
      console.info('是个a标签')
      return
    }
    if (e.target.matches('.action') && e.target.textContent === '+-') {
      // 尝试删除
      console.info('删除数据', e.target.parentNode.dataset.id)
      deleteItemById(e.target.parentNode.dataset.id)
        // e.stopPropagation()
      return
    }
    let targetLi = searchEl('li[data-id]', e.target, e.currentTarget)
    if (targetLi) {
      console.info('找到了存在data-id的li', targetLi.dataset.id)
      console.info(dataStore.get(targetLi.dataset.id))
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
  Promise.resolve().then(() => new Promise(function(resolve, reject) {
    storage.get('ak', function(items) {
      items.ak ? resolve(items.ak) : reject('no ak')
    })
  })).then((ak) => new Promise(function(resolve, reject) {
    storage.get('sk', function(items) {
      items.sk ? resolve({ ak, sk: items.sk }) : reject('has ak, but no sk')
    })
  })).then(function(result) {
    cb(null, result)
  }).catch(function(err) {
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
  return new Promise(function(r, j) {
    // console.info(inited)
    if (inited) {
      r('have inited')
    } else {
      loadKeys(function(err, result) {
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
  }).then(function(result) {
    return result
  }, function(err) {
    return 'error'
  })
}

function loadBasicList() {
  // if (!init) {
  //   return console.info('un loaded')
  // } else {
  //   init()
  // }
  init().then(function(result) {
    console.info(result)
    if (result !== ' error') {
      // 加载列表
      var listEl = document.querySelector('.sider')
      var query = new AV.Query('DailyDone')
      query.find().then(results => {
        // console.info(results)
        // window.tmp = results
        results.map(v => {
          dataStore.set(v.getObjectId(), v)
        })
        renderList('', )
      }).catch(err => console.error(err))
    }
  })


}

function renderList(selector, force) {
  selector = selector || 'main ul'
  force = force || false
  var target = document.querySelector(selector)
  if (!target) return console.info('无效操作对象')
  var tmpFrag = document.createDocumentFragment()
    // var ul = document.createElement('ul')

  let col1 = ['catalog', 'title', 'url', 'createdAt']
  let col2 = ['catalog', 'title', 'description', 'short', 'long', 'action']
  let dictFunc = {
    'url': function(el, data) {
      let tmpHref = document.createElement('a')
      tmpHref.setAttribute('target', '_blank')
      tmpHref.setAttribute('href', data.url)
      tmpHref.setAttribute('title', data.url)
      tmpHref.textContent = getSiteDomain(data.url)
      el.appendChild(tmpHref)
      return null
    },
    'createdAt': function(el, data) {
      el.textContent = (new Date(data[key]).toLocaleString()) || ' - '
    },
    'fallback': function(el, data) {
      el.textContent = data[key] || ' - '
    }
  }

  Array.from(dataStore).map(([_, v]) => {
    let objId = v.getObjectId()
    if (!objId) return console.info('不预期数据')
    if (renderedItem.has(objId)) {
      console.info(' 已渲染 ')
      if (!force) {
        return
      }
      renderedItem.get(objId).remove()
      renderedItem.delete(objId)
      console.info(' 已覆盖渲染 ')
    }
    let li = document.createElement('li')
    li.setAttribute('data-id', objId)

    let data = Object.assign({
      url: undefined,
      title: undefined,
      catalog: undefined,
      description: undefined,
      short: undefined,
      long: undefined,
      createdAt: undefined
    }, v.attributes, {
      createdAt: v.getCreatedAt()
    })
    for (key of col1) {
      let tmpSpan = document.createElement('span')
      tmpSpan.className = key
      if (key in dictFunc) {
        dictFunc[key](tmpSpan, data)
      } else {
        dictFunc.fallback(tmpSpan, data)
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
    renderedItem.set(objId, li)
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
  toDel.destroy().then(function(success) {
    console.info('删除成功')
    document.querySelector(`li[data-id='${id}']`).remove()
  }, function(err) {
    console.err('删除失败', err)
  })
}


/**
 * 返回 url domain
 */
function getSiteDomain(str) {
  return str.split('//').pop().split('/')[0].split('.')[0]
}

/**
 * 查找元素， 用于事件委托
 */
function searchEl(Selector, el, elPool) {
  elPool = elPool || document.documentElement
    // console.log(el), 点击parent
    // 这儿一个bug，我想到了逗号运算符。看起来只能使用逗号运算符调试。
  while ( /*console.info(el),*/ !el.matches(Selector)) {
    if (el === elPool) {
      el = null
      break
    }
    // 之前的bug是 下边这一个语句，放在了while开始部分
    el = el.parentNode
  }
  return el
}