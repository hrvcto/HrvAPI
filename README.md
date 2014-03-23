HrvAPI
======

### 开发
1. 运行查看效果

  A. 安装Node.js
  
  B. 在项目根目录下运行`npm install connect`
  
  C. 安装完成之后运行`node server.js`
  
  D. 安装python环境
  
  E. 运行SocketServer/websocket.bat
  
  访问`http://localhost:8888/cesium.html`来查看“地球“
  
  访问`http://localhost:8888/controlPad.html`来控制“地球“

2. 添加API

  API文件命名规则: api.interfaceName.js, 放在CesiumAPI目录下
  由于采用了require.js来管理js模块，所以每个接口定义都需要特定的格式，具体可参见`api.createPolyline.js`

  js完成之后，在controlPad.html上面添加按钮，用来发送命令给”地球“，分两步：
  
  A. 添加页面元素
  `<button data-type="createPolyline" disabled>Create Polyline</button>`
  
  B. 处理该元素的点击事件(在下面代码处添加)
  `//TODO add other apis`
