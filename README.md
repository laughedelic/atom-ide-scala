# Atom IDE Scala language client

[![](https://travis-ci.org/laughedelic/atom-ide-scala.svg?branch=master)](https://travis-ci.org/laughedelic/atom-ide-scala)
[![](https://img.shields.io/github/release/laughedelic/atom-ide-scala/all.svg)](https://github.com/laughedelic/atom-ide-scala/releases/latest)
[![](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![](https://img.shields.io/badge/contact-gitter_chat-dd1054.svg)](https://gitter.im/laughedelic/atom-ide-scala)

Scala language support for [Atom IDE], powered by [Scalameta language server].

----

### 🚧 WORK IN PROGRESS 🚧

This project is in very early stage and is not ready for daily usage yet. Nevertheless you are welcome to try it out and provide any feedback either in the [Gitter chat](https://gitter.im/laughedelic/atom-ide-scala) or [Github issues](https://github.com/laughedelic/atom-ide-scala/issues).

----

This Atom plugin is written in [Scala.js] and is actively evolving, so if you are a Scala developer looking for a better development experience in Atom, you're encouraged to contribute. Check the [contributing guide](CONTRIBUTING.md) and [open issues](https://github.com/laughedelic/atom-ide-scala/issues) especially the ones marked with `help wanted` label.

This plugin naturally doesn't do much, it just launches the server and wires communication with it to the Atom IDE UI services. All the interesting stuff is happening on the server side, so check also the server repository: [scalameta/language-server](https://github.com/scalameta/language-server).

## Features

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

See also default [Atom IDE keybindings](https://github.com/facebook-atom/atom-ide-ui/blob/master/docs/keybindings.md).

For the full list of implemented and planned features see the [server roadmap](https://github.com/scalameta/language-server/blob/master/README.md#roadmap).

## Installation

* You need to have packages for basic Scala language support and the [IDE UI](https://github.com/facebook-atom/atom-ide-ui) installed. You can install all three at once with this command:
    ```
     apm install language-scala atom-ide-ui atom-ide-scala
    ```

* If you are using [jEnv](http://www.jenv.be) you may need to export `JAVA_HOME` using jEnv plugin:
    ```
    jenv enable-plugin export
    ```


## Usage

1. Follow Scalameta language server [beta testing instructions](https://github.com/scalameta/language-server/blob/master/BETA.md) to prepare your Scala projects.
2. Open a project in Atom. Once you open a Scala file, server will get launched and you will see a spinning indicator in the status bar.
3. Notice that when you close all tabs with Scala files, language server will be stopped. See [atom-languageclient#141](https://github.com/atom/atom-languageclient/issues/141) for discussion on this behavior.


[Scala]: http://scala-lang.org/
[Scala.js]: https://www.scala-js.org/
[Atom IDE]: https://ide.atom.io/
[Scalameta language server]: https://github.com/scalameta/language-server
[LSP]: https://github.com/Microsoft/language-server-protocol
