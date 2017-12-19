# Atom IDE Scala language client

[![](https://travis-ci.org/laughedelic/atom-ide-scala.svg?branch=master)](https://travis-ci.org/laughedelic/atom-ide-scala)
[![](https://img.shields.io/github/release/laughedelic/atom-ide-scala/all.svg)](https://github.com/laughedelic/atom-ide-scala/releases/latest)
[![](https://img.shields.io/apm/v/ide-scala.svg)](https://atom.io/packages/ide-scala)
[![](https://img.shields.io/apm/dm/ide-scala.svg)](https://atom.io/packages/ide-scala)
[![](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![](https://img.shields.io/badge/contact-gitter_chat-dd1054.svg)](https://gitter.im/laughedelic/atom-ide-scala)

Scala language support for [Atom IDE], powered by [Scalameta language server].

![](https://user-images.githubusercontent.com/766656/34135911-aa78092a-e463-11e7-9fdf-710a8deb4093.png)

#### 🚧 WORK IN PROGRESS 🚧

The project is in active development and may have some rough edges. You are welcome to try it out and provide any feedback in the [Gitter chat](https://gitter.im/laughedelic/atom-ide-scala) or [Github issues](https://github.com/laughedelic/atom-ide-scala/issues).

This plugin is written in **[Scala.js]**, so if you are a Scala developer looking for better development experience in Atom, you're encouraged to contribute. Check the [contributing guide](CONTRIBUTING.md) and [open issues](https://github.com/laughedelic/atom-ide-scala/issues) especially the ones marked with `help wanted` label.

The work of this plugin is to launch the language server and wire communication with it to the Atom IDE services. Most of the interesting stuff is happening on the server side, so check also the [scalameta/language-server](https://github.com/scalameta/language-server) project.

## Features

Here is a list of the features which are implemented. It doesn't mean that they all work well, just that they are implemented on the server side and are supported by this plugin. Also notice that some features may take time to activate after you open a new file or change code.

* [Formatting](https://github.com/facebook-atom/atom-ide-ui/blob/master/docs/code-format.md) with [Scalafmt](http://scalameta.org/scalafmt):
  + Add `.scalafmt` [config](http://scalameta.org/scalafmt/#Configuration) to the project
  + Use <kbd>cmd</kbd><kbd>shift</kbd><kbd>C</kbd> hotkey
  + It formats the whole file
* [Diagnostics](https://github.com/facebook-atom/atom-ide-ui/blob/master/docs/diagnostics.md) (linting with [Scalafix](https://scalacenter.github.io/scalafix) and presentation compiler):
  + If you have `.scalafix` configuration in the project, you will see linting messages in the diagnostics panel and red underlines in the code
  + You will also see compilation errors from the presentation compiler as you type
* [Definitions](https://github.com/facebook-atom/atom-ide-ui/blob/master/docs/definitions.md):
  + Hold <kbd>cmd</kbd> and hover to preview the definition or click to jump to the source
* [References](https://github.com/facebook-atom/atom-ide-ui/blob/master/docs/find-references.md):
  + Right-click on a symbol and choose `Find References` in the context menu
  + Or open command palette and run `Find References` command
* [Code Highlights](https://github.com/facebook-atom/atom-ide-ui/blob/master/docs/code-highlight.md):
  + When cursor is placed on a symbol, all its occurrences in the file should get highlighted
* [Datatips](https://github.com/facebook-atom/atom-ide-ui/blob/master/docs/datatips.md) (type on hover):
  + Just hover over a symbol to see its type
  + You can also hold <kbd>alt</kbd> to see the type of symbol under the cursor
* [Outline view](https://github.com/facebook-atom/atom-ide-ui/blob/master/docs/outline-view.md) (symbols tree):
  + Use <kbd>alt</kbd><kbd>O</kbd> to open it
* Auto completions as you type with presentation compiler
  + This requires running `*:scalametaEnableCompletions` in sbt first
* [Signature Help](https://github.com/facebook-atom/atom-ide-ui/blob/master/docs/signature-help.md) (experimental UI):
  + When you type a method name and an open parenthesis you should see information about method parameters

See also default [Atom IDE keybindings](https://github.com/facebook-atom/atom-ide-ui/blob/master/docs/keybindings.md).

For the full list of implemented and planned features see the [server roadmap](https://github.com/scalameta/language-server/blob/master/README.md#roadmap).

## Installation

* You can install it using Atom interface or by running this command:
    ```
    apm install ide-scala
    ```
    On the first launch it will automatically install its dependencies if needed:
    + [language-scala](https://github.com/atom-community/language-scala) for basic Scala syntax highlighting
    + [atom-ide-ui](https://github.com/facebook-atom/atom-ide-ui) for the Atom IDE interface

* If you are using [jEnv](http://www.jenv.be) you may need to export `JAVA_HOME` using jEnv plugin:
    ```
    jenv enable-plugin export
    ```


## Usage

1. Follow Scalameta language server [beta testing instructions](https://github.com/scalameta/language-server/blob/master/BETA.md) to prepare your Scala projects.
2. Open a project in Atom. Once you open a Scala file, server will get launched and you will see a progress indicator in the status bar.
3. Notice that when you close all tabs with Scala files, language server will be stopped. See [atom-languageclient#141](https://github.com/atom/atom-languageclient/issues/141) for discussion on this behavior.


[Scala]: http://scala-lang.org/
[Scala.js]: https://www.scala-js.org/
[Atom IDE]: https://ide.atom.io/
[Scalameta language server]: https://github.com/scalameta/language-server
[LSP]: https://github.com/Microsoft/language-server-protocol
