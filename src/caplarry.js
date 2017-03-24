var APP_ID = 'pknF0GITGKzrcvKxN2xwv7Eb-gzGzoHsz';
var APP_KEY = '4MCcoKuGaEg8xMbH6BF7HaJw';
AV.init({
  appId: APP_ID,
  appKey: APP_KEY
});

// 浏览器的 Console 中设置 localStorage
// localStorage.setItem('debug', 'leancloud*');

if (document.title.indexOf("Google") != -1 || 1) {
    //Creating Elements
    var btn = document.createElement("BUTTON")
    var t = document.createTextNode("CLICK ME");
    btn.appendChild(t);
    //Appending to DOM 
    document.body.appendChild(btn);
}

var TestObject = AV.Object.extend('TestObject');
var testObject = new TestObject();
testObject.save({
  words: 'Hello World! from chrome App'
}).then(function(object) {
  alert('LeanCloud Rocks!');
})