# TRACING MY DOING

1. 浏览[Chrome Extension Sample 例子](https://developer.chrome.com/extensions/samples#page-action-by-url)
2. 询问别人如何通过[Extension更改页面内容](http://stackoverflow.com/questions/14068879/modify-html-of-loaded-pages-using-chrome-extensions)
3. 查看Blog中执行javascript的介绍[developer.chrome](https://developer.chrome.com/extensions/content_scripts#pi)



# 解决思路

1. 使用pageaction url，当url符合自己想要控制的页面时，进行action
2. 使用pageaction content， 检测是否含有想要控制的元素
3. DOM Inject 注入自己的script，然后执行
  