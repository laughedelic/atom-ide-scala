# Atom IDE Scala language client

[![](https://img.shields.io/github/release/laughedelic/atom-ide-scala/all.svg)](https://github.com/laughedelic/atom-ide-scala/releases/latest)
[![](https://img.shields.io/badge/license-LGPLv3-blue.svg)](https://www.tldrlegal.com/l/lgpl-3.0)
[![](https://img.shields.io/badge/contact-gitter_chat-dd1054.svg)](https://gitter.im/laughedelic/atom-ide-scala)

##### Scala language support for Atom IDE using [Scalameta language server](https://github.com/scalameta/language-server)

##### 🚧 WORK IN PROGRESS 🚧

This project is in very early stage and is not ready for daily usage yet. Nevertheless you are welcome to try it out and provide any feedback either in the [Gitter chat](https://gitter.im/laughedelic/atom-ide-scala) or [Github issues](https://github.com/laughedelic/atom-ide-scala/issues).

### Features

Here is a list of the features which are implemented. It doesn't mean that they work well, just that they are implemented on the server side and supported by this plugin.

* [Formatting](https://github.com/facebook-atom/atom-ide-ui/blob/master/docs/code-format.md) with [Scalafmt](http://scalameta.org/scalafmt):
  + Add [Scalafmt config](http://scalameta.org/scalafmt/#Configuration) to the project
  + Use <kbd>cmd</kbd><kbd>shift</kbd><kbd>C</kbd> hotkey
  + It formats the whole file
* [Definitions](https://github.com/facebook-atom/atom-ide-ui/blob/master/docs/definitions.md):
  + It works only on the sources inside the project
  + Hold <kbd>cmd</kbd> and hover to preview the definition
  + Hold <kbd>cmd</kbd> and click to jump to the definition
* [Datatips](https://github.com/facebook-atom/atom-ide-ui/blob/master/docs/datatips.md) (type on hover):
  + Just hover over a symbol to see its type
  + You can also hold <kbd>alt</kbd> to see the type of symbol under the cursor
* [Outline view](https://github.com/facebook-atom/atom-ide-ui/blob/master/docs/outline-view.md) (symbols list):
  + Use <kbd>alt</kbd><kbd>O</kbd> to open it
* Auto completions as you type with presentation compiler
  + This requires running `*:scalametaEnableCompletions` in sbt first

See also other default Atom IDE [keybindings](https://github.com/facebook-atom/atom-ide-ui/blob/master/docs/keybindings.md).

For the full list of implemented and planned features see the [server roadmap](https://github.com/scalameta/language-server/blob/master/README.md#roadmap).


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

    Remember that in every project you need to add SemanticDB settings first. See instructions [here](http://scalameta.org/tutorial/#sbt). This is mentioned in the linked above server setup instructions.

#### Debugging

Open Developer Console with <kbd>cmd</kbd><kbd>alt</kbd><kbd>I</kbd>  and run there

```
atom.config.set('core.debugLSP', true)
```

Now you will see all communication between the client and language server.
