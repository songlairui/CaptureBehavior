var a = document.getElementsByClassName('submit-box');
var ta = document.getElementsByTagName('textarea');
window.alert('test')
alert('test2')
console.group('Catch Handler')
console.log(document.readystate)
console.groupEnd()
a[0].addEventListener("click",
  function () {
    console.log("btn click");
  }, false);
a[0].addEventListener("mouseover",
  function () {
    console.log("btn over");
  }, false);
a[0].onclick = function () {
  var text = ta[0].value
  console.log('aaa')
  alert('点击了' + text + '.')
}
ta[0].onclick = function () {
  console.log('准备输入')
}