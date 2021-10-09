const vscode = require('vscode')
const path = require('path')
const fs = require('fs')

function setHtml() {
  const src = vscode.workspace.getConfiguration().get('dynamic-vscode.url');
  return `<!DOCTYPE html>
<html lang="Zh-Cn" style="height: 100vh">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body style="background: #fff; height: 100%; padding: 0;">
  <iframe
    src="${src}"
    width="100%"
    height="100%"
    frameborder="0"
  ></iframe>
  <script>
    (function() {
      const vscode = acquireVsCodeApi();
      window.addEventListener('message', (event) => {
        const { action, data } = event.data;
        vscode.postMessage(event.data)
      })
    }())
  </script>
</body>
</html>
  `
}

module.exports = function (context) {
  console.log('trigger')
  context.subscriptions.push(vscode.commands.registerCommand('dynamic-vscode.open', (uri) => {
    const pclintBar = vscode.window.createStatusBarItem();
    const dirPath = path.dirname(uri.fsPath);
    pclintBar.text = `目标文件夹：${dirPath}`
    pclintBar.show();

    const panel = vscode.window.createWebviewPanel(
      'dynamic-form',
      '设计器',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      }
    )
    panel.webview.html = setHtml();
    panel.onDidChangeViewState(() => {
      panel.visible ? pclintBar.show() : pclintBar.hide();
    })
    panel.webview.onDidReceiveMessage(event => {
      const { action, data } = event;
      switch(action) {
        case 'download':
          fs.writeFileSync(dirPath + '/test.vue', data.code, 'utf-8');
          vscode.window.showInformationMessage('保存完成')
          break;
      }
    }, null, context.subscriptions)
    // panel.webview.postMessage({
    //   action: 'setSrc',
    //   data: uri.fsPath
    // })
  }))
}