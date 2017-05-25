var storage = chrome.storage.local;
var lastCollected = {}
var collectData = { url: '', title: '', catalog: '', description: '' }
var commited = false
var lasturl = ''


document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('.send').addEventListener('click', collectNew)


  insertHrefs()
  initForm()
  // 初始化 keys
  loadKeys(function (err, result) {
    document.querySelector('.option').textContent += err ? ",wrong keys" : ", keys settled"
    let appId = result.ak;
    let appKey = result.sk;
    AV.init({ appId, appKey });
  })


})

document.addEventListener('input', throttle([function (e) {
  // console.info(e.type, ' 来自 ', e.target, e.currentTarget)
  let inputEl = e.target
  let attr = inputEl.dataset.name
  collectData[attr] = inputEl.innerHTML
  // setTimeout(function () {
  //   console.info(collectData[attr])
  // }, 0)
  commited = false
  msg(`currentData: ${JSON.stringify(collectData)}`)
  snapForms({ collectData, commited })
}, function (e) {
  let inputEl = e.target
  let targetEl = inputEl.parentNode
  if (!targetEl) return
  inputEl.textContent !== "" ? targetEl.classList.add('filled') : targetEl.classList.remove('filled')
}]))

document.addEventListener('keypress', function (e) {
  let inputEl = e.target
  let multi = inputEl.dataset.multi === 'true'
  // console.info(multi, e)
  // 如果不是回车，返回true
  // 多行，输入内容，单行，不输入任何内容。
  if (e.keyCode != 13) return true
  if (multi) {
    var docFragment = document.createDocumentFragment();

    //add a new line
    var newEle = document.createTextNode('\n\r');
    docFragment.appendChild(newEle);

    // 否则替换输入的内容
    let range = window.getSelection().getRangeAt(0)
    range.deleteContents()

    range.insertNode(docFragment)

    //create a new range
    range = document.createRange()
    range.setStartAfter(newEle)
    range.collapse(true)

    //make the cursor there
    var sel = window.getSelection()
    sel.removeAllRanges()
    sel.addRange(range)
  }
  e.preventDefault()
})

// 弃用的 方法。
// class LabelMe {
//   constructor() {
//     this.el = document.querySelectorAll('.block')
//     this.bindEvent()
//   }

//   bindEvent() {
//     for (var i = 0; i < this.el.length; i++) {
//       let target = this.el[i]

//       target.addEventListener('keypress', function (e) {
//         let el = e.currentTarget
//         let child = el.querySelector('[class^="input-"]')
//         // console.info(el, child)
//         if (!child) { return }
//         let filled = child.textContent !== ""
//         if (filled) {
//           el.classList.add('filled')
//         } else {
//           el.classList.remove('filled')
//         }

//       })
//     }
//   }
// }


/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function (tabs) {
    // chrome.tabs.query invokes the callback with a list of tabs that match the
    // query. When the popup is opened, there is certainly a window and at least
    // one tab, so we can safely assume that |tabs| is a non-empty array.
    // A window can only have one active tab at a time, so the array consists of
    // exactly one tab.
    var tab = tabs[0];

    // A tab is a plain object that provides information about the tab.
    // See https://developer.chrome.com/extensions/tabs#type-Tab
    var url = tab.url;

    // tab.url is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "url" properties.
    // console.info(url)
    console.assert(typeof url === 'string', 'tab.url should be a string');

    callback(url);
  });
}

function trimContent(str, multi) {
  let result
  if (multi) {
    // 替换换行符，替换div，替换p
    result = str
      .replace(/<br(\s*)\/*/g, '\n')
      .replace(/<div>/g, '\n')
      .replace(/<\/div>/g, '')
  } else {
    result = str
      .replace(/<br(\s*)\/*/g, '')
      .replace(/<div>/g, '')
      .replace(/<\/div>/g, '')
  }
  console.info(str, result)
  return result
}

function collectNew() {
  console.info('collectNew')
  if (!collectData.title || !collectData.url) {
    msg('无内容')
    return console.error('无内容')
  }
  // console.info(collectData.description)
  // console.log(collectData.description.replace('\n','\\n'))
  // return
  // 声明一个 Todo 类型
  var DailyDone = AV.Object.extend('DailyDone')
  // 新建一个 Todo 对象
  var dailydone = new DailyDone()
  dailydone.set('title', collectData.title)
  dailydone.set('url', collectData.url)
  dailydone.set('short', collectData.short)
  dailydone.set('long', collectData.long)
  dailydone.set('catalog', collectData.catalog)
  dailydone.set('description', collectData.description)
  dailydone.save().then(function (dailydone) {
    // 成功保存之后，执行其他逻辑.
    console.log('New object created with objectId: ' + dailydone.id)
    msg('New object created with objectId: ' + dailydone.id)
    commited = true
    snapForms({commited})
  }, function (error) {
    // 异常处理
    console.error('Failed to create new object, with error message: ' + error.message)
    msg('Failed to create new object, with error message: ' + error.message)
  });
}

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
/**
 * 显示提示信息
 * @param  {} str
 */
function msg(str) {
  if (typeof str !== 'string') return
  let alertEl = document.querySelector('.alert')
  alertEl.textContent = str
}
/**
 * 节流函数
 * @param  {} func   要执行的函数
 * @param  {} func2  要每次都立即执行的函数
 * @param  {} delay  时间间隔之内，如果再次触发，则重置计时器
 * @param  {} max    触发事件，发现上次执行时间比当前超过max，则立即执行。
*/
function throttle([func, func2], delay, max) {
  delay = +delay || 400
  max = +max || 1200
  var lastCallStamp = 0
  var timer
  function throttle() {
    var _this = this
    var args = arguments
    func2 ? func2.apply(_this, args) : null
    if (timer) {
      clearTimeout(timer)
      timer = null
      // console.info(throttle.lastCallStamp)
      if (Date.now() - throttle.lastCallStamp > max) {
        // console.info(`   到达 ${max} 时长，执行一次`)
        throttle.lastCallStamp = Date.now()
        func.apply(_this, args)
        return
      }
      // console.info(`        timer还在，不执行`)
    }
    timer = setTimeout(function () {
      clearTimeout(timer)
      timer = null
      throttle.lastCallStamp = Date.now()
      // console.info(`    更新了`, throttle.lastCallStamp)
      func.apply(_this, args)
    }, delay)
  }
  throttle.lastCallStamp = lastCallStamp
  return throttle
}

var snapForms = async function (obj) {
  console.info('存储了', obj)
  let result = []
  await new Promise((r, j) => {
    storage.set(obj, function () {
      console.info('存了', obj)
      r()
    })
  })
  // for (key in obj) {
  //   console.info('存', { [key]: obj[key] })
  //   await new Promise((r, j) => {
  //     storage.set({ [key]: obj[key] }, function () {
  //       result.push[key]
  //       r()
  //     })
  //   })
  // }
  console.info('finished', result.join(','))
}

var initForm = async function () {
  // var initForm = function () {
  await new Promise((r, j) => {
    storage.get('commited', function (data) {
      if (typeof data.commited !== 'undefined') {
        commited = data.commited
        console.info('commited:',commited)
        r()
      } else {
        j()
      }
    })
  }).catch(err => { console.error(err) })
  await new Promise((r, j) => {
    storage.get('collectData', function (data) {
      if (data.collectData) {
        lastCollected = data.collectData
        console.info(lastCollected)
        r()
      } else {
        j()
      }
    })
  },
    () => {
      console.info('rejected1')
      return ''
    }
  ).catch(err => { console.error(err) })
  console.info(commited, lastCollected, collectData)
  // Promise.resolve()
  //   .then(() =>
  //     new Promise((r, j) => {
  //       storage.get('commited', function (data) {
  //         console.info(data)
  //         if (typeof data.commited !== 'undefined') {
  //           commited = data.commited
  //           r()
  //         } else {
  //           j()
  //         }
  //       })
  //     })
  //   )
  //   .then(() =>
  //     new Promise((r, j) => {
  //       storage.get('collectData', function (data) {
  //         if (data.collectData) {
  //           lastCollected = data.collectData
  //           console.info(lastCollected)
  //           r()
  //         } else {
  //           j()
  //         }
  //       })
  //     }),
  //   () => {
  //     console.info('rejected1')
  //     return ''
  //   }
  //   )
  //   .then(() => {
  //     console.info(commited, lastCollected, collectData)
  //   },
  //   () => {
  //     console.info('rejected2')
  //     return ''
  //   }).then(function(){

  //   })


  if (!commited) {
    collectData = lastCollected
    for (key in collectData) {
      let tmpEl = document.querySelector(`[data-name='${key}']`)
      tmpEl.textContent = collectData[key]
      collectData[key] ? tmpEl.parentNode.classList.add('filled') : tmpEl.parentNode.classList.remove('filled')
    }
  }
  lasturl = lastCollected.url || ''
  // 初始化操作的最后，录入当前页面url
  getCurrentTabUrl(function (url) {
    collectData.url = url
  })
}
// test function
// var snapForms = async function (obj) {
//   let result = []
//   for (keys in obj) {
//     await new Promise((r, j) => {
//       result.push(keys)
//       console.info(result)
//       setTimeout(r, 300)
//     })
//   }
//   console.info('finished', result.join(','))
// }
// snapForms({a:{b:1,c:2},d:3})

function insertHrefs() {
  var oFragment = document.createDocumentFragment()
  var optionsHtml = document.createElement('a')
  // var attr = document.createAttribute('target')
  // attr.nodeValue = '_blank'
  optionsHtml.setAttribute('target', '_blank')
  optionsHtml.classList.add('option')
  optionsHtml.href = chrome.extension.getURL('options.html')
  optionsHtml.textContent = 'Option Page'

  var dashboardEl = document.createElement('a')
  dashboardEl.href = chrome.extension.getURL('dashboard.html')
  dashboardEl.setAttribute('target', '_blank')
  dashboardEl.textContent = 'dashboard'

  oFragment.append(dashboardEl)
  oFragment.append(document.createTextNode('  -  '))
  oFragment.append(optionsHtml)
  document.body.append(oFragment)
}

function initStyle() {
  targets = document.querySelectorAll('[data-name]')
  for (var i = 0; i < targets.length; i++) {
    let p = targets[i].parentNode
    targets.textContent === "" ? p.classList.add('filled') : p.classList.remove('filled')
  }
}