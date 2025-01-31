# Streamlabs Desktop

[![Build Status](https://dev.azure.com/streamlabs/Streamlabs%20OBS/_apis/build/status/stream-labs.streamlabs-obs?branchName=staging)](https://dev.azure.com/streamlabs/Streamlabs%20OBS/_build/latest?definitionId=1&branchName=staging)

Simple, powerful, and efficient live streaming software built on Electron and OBS.

![Streamlabs Desktop](https://slobs-cdn.streamlabs.com/media/streamlabs-desktop_1920x1050.png)

This application currently only supports OSX 10.14+ and 64-bit Windows.

## Dependencies

**注意：**
需要注意版本，否则可能编译失败：

* npm 9.2.0
* nodejs v16.18.1
* yarn 3.1.1

### Node.js

Node is required for installing npm packages and for running
various scripts. We recommend the latest LTS release.

https://nodejs.org

### Yarn

We use Yarn as our package manager. We use yarn modern (berry) with
the yarn version checked in to version control. To get the yarn CLI,
we currently recommend installing it with npm:

```
npm install -g yarn
```

### Bash

Some of our scripts assume a bash-like environment. On Windows, we recommend
using Git Bash, which is included with Git for Windows. On macOS, the
default shell should work fine.

### Native Modules

Streamlabs Desktop uses several native C++ modules. These are NPM modules
that live in separate repositories, and are automatically installed as prebuilt
binaries by Yarn. If you are not doing any development on these native modules,
no additional action is required to install native modules.

## Installation

Install all node modules via yarn:

```
yarn install
```

PS: Here may occurr some error like:

1. slobs-client build error: change node vertion to v16.18.1
2. electron install/build error: 
    > 操作步骤
    > 
    > 步骤1-通过yarn 或者 npm安装 electron
    > 
    >    `yarn add electron@8.0.0`
    > 
    > 这个目的不是为了安装成功（能成功后面的步骤就不用看了），而是生成目录结构和基础文件。如 electron 目录、index.js 等
    > 
    > 步骤2-下载 electron 压缩包
    > 
    > 首先找到 electron github 上发布的包地址。如windows 64位环境可用这个模板地址：
    > 
    > https://github.com/electron/electron/releases/download/v版本号/electron-v版本号-win32-x64.zip，那么对应的 v8.0.0 版本地址就是：
    > 
    > https://github.com/electron/electron/releases/download/v8.0.0/electron-v8.0.0-win32-x64.zip
    > 
    > 浏览器地址栏输入地址即可下载压缩文件
    > 
    > 步骤3- */node_modules/electron/ 目录下创建dist 目录
    > 
    >  在*/node_modules/electron/ 目录下创建dist 目录，然后将上一步下载的文件解压到 dist 目录中
    > 
    > 步骤4-创建 path.txt 文件
    > 
    > 创建 path.txt 文件，并写入文本内容为：electron.exe
    > 
    > 再次执行`yarn install`


Then, compile assets with webpack:

```
yarn compile
```

Alternatively, you can watch for changes to app files:

```
yarn watch
```

## Starting

You can start the app by running:

```
yarn start
```

## Environment Variables

These variables can be used in development to force certain behavior.

`SLOBS_FORCE_AUTO_UPDATE`: Force the auto-updater to run in development. Normally
this would only run in production.

`SLOBS_CACHE_DIR`: Force a different location for the user data cache directory.

`SLOBS_DISABLE_MAIN_LOGGING`: Disable javascript logging in the main process.

`SLOBS_REPORT_TO_SENTRY`: Report errors to sentry in the dev environment

`SLOBS_PRODUCTION_DEBUG`: Forces dev tools to open when the app starts

## Development

You can open dev tools by clicking the `</>` button on the sidebar.
In the development environment, the titlebar of the main window will
light up red when an exception occurs in any window.

Our app is comprised of several windows, which are essential separate
copies of the same Javascript app, which are running different pieces
of the code and communicating via Electron IPC.

`worker` - This is a persistent invisible window that runs our entire
services layer.

`main` - This is the main window of the application. It communicates
with the worker window to perform actions.

`child` - This window is always running in the background, and appears
to show windows like Source Properties. It stays always running because
Electron windows can take several seconds to initialize, so we keep it
ready in the background.

There are potentially many other JS runtime processes that can be running
depending on use, for features like Apps, embedded webviews, one-off windows
like projectors, pop-outs etc.

### Sync / Async

Given the heavy reliance on interprocess communication in our application,
we strongly recommend using asynchronous IPC whenever possible. When
accessing a service, calling it as an action will call it asynchronously.

For example the following (synchronous):

```
StreamingService.toggleStreaming()
```

Can be rewritten as (asynchronous):

```
StreamingService.actions.toggleStreaming()
```

The return type of the latter will automatically be `void` as actions
are unable to return values.  In general, receiving information from
services is best done via `views`.  `views` are executed in-window, and
backed by our `vuex` data store, which is replicated across windows.

### Vue / React

We are in the process of migrating from Vue to React. There are many components
of both frameworks in our codebase currently. All new components should be
written in React, and major non-trivial changes to existing Vue components
should be accompanied with a rewrite to React.

We exclusively use functional components in React, relying on the hooks API
for things like component state and lifecycle.

## Contributing

We accept outside contributions, and do our best to respond to Pull Requests.
We ask that all contributors sign a Contributor License Agreement before merging
code. We do not guarantee that all external Pull Requests will be merged, but
we deeply appreciate any and all changes submitted. Thank you for your interest
and contribution.

### Translations

At this time, we are not able to accept translations submitted to GitHub, as we
use a professional translation team that manages translations elsewhere.

## Packaging/Distribution

**注意：**

如果打包失败，报错`SignTool Error: No certificates were found that met all the given criteria.`，很有可能是签名的问题。

可以将环境变量`SLOBS_NO_SIGN`设为true，既`export SLOBS_NO_SIGN=true`

For Windows:

```
yarn package
```

For macOS:

```
yarn package:mac
```

Note that both of these commands require code signing certificates to be
present in the environment, and in the case of macOS, a valid Apple developer
account for notarization of the app package.

There are some environment variables that can be passed to skip these steps:

`SLOBS_NO_SIGN` Do not attempt to codesign the app package

`SLOBS_NO_NOTARIZE` Do not attempt to notarize the macOS package

## ❤ OBS Developers

At its core, Streamlabs Desktop is powered by the [OBS](https://obsproject.com/)
project. We want to thank all of the developers over at the OBS project for
their years of tireless hard work, without which Streamlabs Desktop wouldn't exist today.
