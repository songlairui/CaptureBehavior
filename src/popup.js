

document.addEventListener('DOMContentLoaded', function () {
  getCurrentTabUrl(function (url) {
    // urlEl.textContent = url
    // mySend.data.url = url

    // 事件委托，只使用一个监听器
    // new LabelMe()
    var urlEl = document.querySelector('.url')
    // 监听一个 block 区域

  })
})

document.addEventListener('input', function (e) {
  // console.info(e.type, ' 来自 ', e.target, e.currentTarget)
  let inputEl = e.target
  let targetEl = inputEl.parentNode
  if (!targetEl) return
  inputEl.textContent !== "" ? targetEl.classList.add('filled') : targetEl.classList.remove('filled')
})

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
    var newEle = document.createTextNode('\n');
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

class LabelMe {
  constructor() {
    this.el = document.querySelectorAll('.block')
    this.bindEvent()
  }

  bindEvent() {
    for (var i = 0; i < this.el.length; i++) {
      let target = this.el[i]

      target.addEventListener('keypress', function (e) {
        let el = e.currentTarget
        let child = el.querySelector('[class^="input-"]')
        // console.info(el, child)
        if (!child) { return }
        let filled = child.textContent !== ""
        if (filled) {
          el.classList.add('filled')
        } else {
          el.classList.remove('filled')
        }

      })
    }
  }
}


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
    console.assert(typeof url == 'string', 'tab.url should be a string');

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