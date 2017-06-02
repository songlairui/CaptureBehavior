var storage
if (typeof chrome !== 'undefined' && chrome.storage) {
  storage = chrome.storage.local
}
let dataStore = new Map()
let renderedItem = new Map()
  // 初始化 keys
let inited = false
// html的overflow-y为hidden，每次加载页面都重置到左侧顶部
window.scrollTo(0,0)

document.addEventListener('DOMContentLoaded', function() {
  loadBasicList()
  document.querySelector('body').addEventListener('click', function(e) {
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
    if (e.target.matches('button.reset')) {
      toggleFocus(0)
      return
    }

    if (searchEl('.load', e.target, e.currentTarget)) {
      loadBasicList()
      return
    }
    if (searchEl('nav', e.target, e.currentTarget)) {
      toggleFocus(0)
      return
    }
    let targetLi = searchEl('li[data-id]', e.target, e.currentTarget)
    if (targetLi) {
      console.info('找到了存在data-id的li', targetLi.dataset.id)
      console.info(dataStore.get(targetLi.dataset.id))
      renderCard(dataStore.get(targetLi.dataset.id))
      toggleFocus(1)
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
    if (!storage) {
      resolve('LRFvEGR2zUEJ5JDyaSaVtwIB-gzGzoHsz')
    } else {
      storage.get('ak', function(items) {
        items.ak ? resolve(items.ak) : reject('no ak')
      })
    }
  })).then((ak) => new Promise(function(resolve, reject) {
    if (!storage) {
      resolve({ ak, sk: 'hyXKUvdrhQO35tmiXWq8w3gz' })
    } else {
      storage.get('sk', function(items) {
        items.sk ? resolve({ ak, sk: items.sk }) : reject('has ak, but no sk')
      })
    }
  })).then(function(result) {
    cb(null, result)
  }).catch(function(err) {
    console.error(err)
    cb(err)
  })
}

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
  init().then(function(result) {
    console.info(result)
    if (result !== ' error') {
      // 加载列表
      var listEl = document.querySelector('.sider')
      var query = new AV.Query('DailyDone')
      query.find().then(results => {
        // console.info(results)
        window.tmp0 = results
          // 假装全量获取数据，同步已删除的数据
        let tmp = results.map(v => v.getObjectId())
        for ([key] of dataStore) {
          if (tmp.indexOf(key) === -1) {
            // 取到的数据中，
            console.info('删除一个数据')
            renderedItem.get(key).remove()
            renderedItem.delete(key)
            dataStore.delete(key)
          } else {
            console.info('有，')
          }
        }
        results.map(v => {
          dataStore.set(v.getObjectId(), v)
        })
        renderList('', 0)
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

  let col1 = ['catalog', 'title', 'url', 'createdAt', 'action']
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
      el.textContent = (new Date(data.createdAt).toLocaleString()) || ' - '
    },
    'fallback': function(el, data, key) {
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
      createdAt: undefined,
      action: '+-'
    }, v.attributes, {
      createdAt: v.getCreatedAt()
    })
    col1.reduce(function(prev, curr) {
      let tmpDiv = document.createElement('div')
      tmpDiv.className = curr
      let tmpSpan = document.createElement('span')
      if (curr in dictFunc) {
        dictFunc[curr](tmpSpan, data)
      } else {
        dictFunc.fallback(tmpSpan, data, curr)
      }
      tmpDiv.appendChild(tmpSpan)
      prev.appendChild(tmpDiv)
      return tmpDiv
    }, li)
    tmpFrag.appendChild(li)
    renderedItem.set(objId, li)
  })
  target.appendChild(tmpFrag)
}


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

/**
 * 切换显示状态
 */
function toggleFocus(status) {
  if (document.body.classList.contains('focus')) {
    if (status !== undefined && !!status) return
    document.body.classList.remove('focus')
  } else {
    if (status !== undefined && !status) return
    document.body.classList.add('focus')
  }
}

/**
 * 显示Card 内容
 */
function renderCard(data) {
  let card = document.querySelector('.detail .card')
  let item = ['short', 'title', 'long', 'description']
  item.map(v => {
    let target = card.querySelector(`[data-key='${v}']`)
    target.textContent = data.get(v)
  })
}