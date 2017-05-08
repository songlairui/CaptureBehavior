console.log("注入执行了代码")
console.group('Catch Handler')
console.log(document.readystate)
console.groupEnd()

var a, ta, timer, n
n = 1

function bind() {
  a = document.getElementsByClassName('submit-box');
  ta = document.getElementsByTagName('textarea');
  if (a[0] && ta[0]) {
    // console.info('已获取元素', a[0], ta[0])
    var APP_ID = 'F6hbjpqohXN2dboAG0z5YOTp-gzGzoHsz';
    var APP_KEY = 'sxTFm5XXDdf5aFJQbaCTNCiG';
    AV.init({
      appId: APP_ID,
      appKey: APP_KEY
    });

    a[0].addEventListener("click",
      function () {
        var comment = ta[0].value
        console.log('输入了' + comment + '.')
        console.log('当前的地址：', window.location.href)
        console.info('表述：', "x天x午x点，我在x网站的文章x下发表了[抖机灵]评论。")

        var TraceObject = AV.Object.extend('TraceObject');
        var traceObject = new TraceObject();
        traceObject.save({
          comment,
          url: window.location.href
        }).then(function (object) {
          console.log('已录入')
        })
      });
    ta[0].onfocus = function () {
      console.log('准备输入')
    }
  } else {
    console.info('未获取元素')
    // 等待 500 ms 后重新尝试执行
    // if(timer) clearInterval(timer)
    if (n > 5) return undefined
    timer = setTimeout(function () {
      console.log('第', n, '次尝试执行')
      n += 1
      // timer = null
      bind();
    }, 500)
  }
}

bind();