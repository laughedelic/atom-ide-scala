# Atom IDE Scala language client

[![](https://img.shields.io/github/release/laughedelic/atom-ide-scala/all.svg)](https://github.com/laughedelic/atom-ide-scala/releases/latest)
[![](https://img.shields.io/badge/license-LGPLv3-blue.svg)](https://www.tldrlegal.com/l/lgpl-3.0)
[![](https://img.shields.io/badge/contact-gitter_chat-dd1054.svg)](https://gitter.im/laughedelic/atom-ide-scala)

##### Scala language support for Atom IDE using [Scalameta language server](https://github.com/scalameta/language-server)

##### 🚧 WORK IN PROGRESS 🚧

This project is in very early stage and is not ready for daily usage yet. Nevertheless you are welcome to try it out and provide any feedback either in the [Gitter chat](https://gitter.im/laughedelic/atom-ide-scala) or [Github issues](https://github.com/laughedelic/atom-ide-scala/issues).


### Development setup

1. First, you need to setup the server. It's not published anywhere yet, so you will have to clone server project and publish it locally. Follow instructions in the [scalameta/language-server](https://github.com/scalameta/language-server/blob/master/CONTRIBUTING.md) repository (skip things related to VS Code).

2. Next, you should install this plugin locally (and first uninstall it if you already had it):

    ```
    apm uninstall ide-scala
    apm develop ide-scala [<where_you_want_to_clone_it>]
    ```

    This will

    > Clone the given package's Git repository to the directory specified, install its dependencies, and link it for development to ~/.atom/dev/packages/<package_name>.
    >
    > If no directory is specified then the repository is cloned to ~/github/<package_name>.

3. Now you can go to any Scala project you have (for example `test-workspace` from the scalameta/language-server repository) and open an Atom window in the development mode:

    ```
    atom --dev .
    ```

    Or use <kbd>cmd</kbd><kbd>shift</kbd><kbd>O</kbd> hotkey in a running Atom.


#### Debugging

Open Developer Console with  and run there

```
atom.config.set('core.debugLSP', true)
```

Now you will see all communication between the client and language server.
