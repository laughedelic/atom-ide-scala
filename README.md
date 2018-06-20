# Atom IDE Scala language client

[![](https://travis-ci.org/laughedelic/atom-ide-scala.svg?branch=master)](https://travis-ci.org/laughedelic/atom-ide-scala)
[![](https://img.shields.io/github/release/laughedelic/atom-ide-scala/all.svg)](https://github.com/laughedelic/atom-ide-scala/releases/latest)
[![](https://img.shields.io/apm/dm/ide-scala.svg)](https://atom.io/packages/ide-scala)
[![](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![](https://img.shields.io/badge/contact-gitter_chat-dd1054.svg)](https://gitter.im/laughedelic/atom-ide-scala)

Scala & Dotty support for [Atom IDE], powered by [Metals], [Dotty] and [Ensime] language servers.

![](https://user-images.githubusercontent.com/766656/34135911-aa78092a-e463-11e7-9fdf-710a8deb4093.png)

#### 🚧 WORK IN PROGRESS 🚧

The project is in active development and may have some rough edges. You are welcome to try it out and provide any feedback in the [Gitter chat](https://gitter.im/laughedelic/atom-ide-scala) or [Github issues](https://github.com/laughedelic/atom-ide-scala/issues).

This plugin is written in **[Scala.js]**, so if you are a Scala developer looking for better development experience in Atom, you're encouraged to contribute. Check the [contributing guide](CONTRIBUTING.md) and [open issues](https://github.com/laughedelic/atom-ide-scala/issues) especially the ones marked with `help wanted` label.

The work of this plugin is to launch the language server and wire communication with it to the Atom IDE services. Most of the interesting stuff is happening on the server side, so check also the [scalameta/metals](https://github.com/scalameta/metals) project.

During development some reusable parts were split into separate repos:

* [scalajs-atom-api](https://github.com/laughedelic/scalajs-atom-api): Scala.js facades for Atom-related APIs (including atom-languageclient)
* [sbt-atom-package](https://github.com/laughedelic/sbt-atom-package): an sbt plugin wraping apm and simplifying development of Scala.js-based Atom plugins

## Features

<details><summary> ⚠️ This list is outdated and refers only to the Metals features. Check each supported server documentation to find out which features they support.</summary>

Here is a list of the features which are implemented. It doesn't mean that they all work well, just that they are implemented on the server side and are supported by this plugin. Also notice that some features may take time to activate after you open a new file or change code.

* [Formatting](https://github.com/facebook-atom/atom-ide-ui/blob/master/docs/code-format.md) with [Scalafmt](http://scalameta.org/scalafmt):
  + Add `.scalafmt` [config](http://scalameta.org/scalafmt/#Configuration) to the project
  + Use <kbd>Cmd</kbd><kbd>Shift</kbd><kbd>C</kbd> hotkey
  + It formats the whole file
* [Diagnostics](https://github.com/facebook-atom/atom-ide-ui/blob/master/docs/diagnostics.md) (linting with [Scalafix](https://scalacenter.github.io/scalafix) and presentation compiler):
  + If you have `.scalafix` configuration in the project, you will see linting messages in the diagnostics panel and red underlines in the code
  + You will also see compilation errors from the presentation compiler as you type
* [Definitions](https://github.com/facebook-atom/atom-ide-ui/blob/master/docs/definitions.md):
  + Hold <kbd>Cmd</kbd> and hover to preview the definition or click to jump to the source
* [References](https://github.com/facebook-atom/atom-ide-ui/blob/master/docs/find-references.md):
  + Right-click on a symbol and choose `Find References` in the context menu
  + Or open command palette and run `Find References` command
* [Code Highlights](https://github.com/facebook-atom/atom-ide-ui/blob/master/docs/code-highlight.md):
  + When cursor is placed on a symbol, all its occurrences in the file should get highlighted
* [Datatips](https://github.com/facebook-atom/atom-ide-ui/blob/master/docs/datatips.md) (type on hover):
  + Just hover over a symbol to see its type
  + You can also hold <kbd>Alt</kbd> to see the type of symbol under the cursor
* [Outline view](https://github.com/facebook-atom/atom-ide-ui/blob/master/docs/outline-view.md) (symbols tree):
  + Use <kbd>Alt</kbd><kbd>O</kbd> to open it
* Auto completions as you type with presentation compiler
  + This is experimental and requires some extra setup
* [Signature Help](https://github.com/facebook-atom/atom-ide-ui/blob/master/docs/signature-help.md) (experimental UI):
  + When you type a method name and an open parenthesis you should see information about method parameters

See also default [Atom IDE keybindings](https://github.com/facebook-atom/atom-ide-ui/blob/master/docs/keybindings.md).

For the full list of implemented and planned features see the [overview](https://github.com/scalameta/metals/blob/master/docs/overview.md) of the Metals project.

</details>

## Installation

You can install it by following [this link](atom://settings-view/show-package?package=ide-scala) or by running this command:

```
apm install ide-scala
```

On the first launch it will automatically install its dependencies if needed:
+ [language-scala](https://github.com/atom-community/language-scala) for basic Scala syntax highlighting
+ [atom-ide-ui](https://github.com/facebook-atom/atom-ide-ui) for the Atom IDE interface

## Usage

This plugin can work with different Scala language servers. You can use it for Scala-2.12 Metals projects as well as for the Dotty projects.

In any case it is expected that you first follow the corresponding language server setup instructions to prepare your project. Usually it involves installing an sbt plugin and running some setup command for every new project. The Atom plugin will check the project setup and choose the right server automatically. This is configurable:

* you can select a default server which will be used for all new projects (you're still expected to setup your projects manually until servers can do it on their own)
* you can turn off automatic server choice if you always want to use same server

Plugin gets activated only when you open a `.scala` file.

> ⚠️ Notice that when you close all tabs with Scala files, language server will be stopped. See [atom-languageclient#141](https://github.com/atom/atom-languageclient/issues/141) for discussion on this behavior.

### Metals

1. Follow Metals [installation instructions](https://scalameta.org/metals/docs/installation-contributors.html) to prepare a project.
1. Open this project in Atom. Once you open a Scala file, you will see the server launching.

### Dotty

1. Setup a [Dotty sbt project](https://github.com/lampepfl/dotty-example-project) and run `sbt configureIDE` in it.  
    Official instructions may tell you to run `launchIDE` in sbt, but this command can only launch VS Code, so just use `configureIDE` instead and open the project in Atom.
1. Open this project in Atom. Once you open a Scala file, you will see the server launching.

### Ensime

🚧 Ensime support is very much experimental, because the LSP implementation of the Ensime server is quite unstable at the moment. So even if the client works well, the server might be broken and you won't see any features working. 🚧

1. Follow [Ensime documentation](http://ensime.github.io/getting_started/) to generate an `.ensime` project file.
1. Open this project in Atom. Once you open a Scala file, the server will start (bu you may not notice it).
1. Open the developer console (<kbd>Cmd</kbd><kbd>Alt</kbd><kbd>I</kbd>) and observe the logs (most likely errors).

Follow [ensime-server#1935](https://github.com/ensime/ensime-server/issues/1935) for more information and _get involved if you want to use Ensime LSP server_.


[Scala]: http://scala-lang.org/
[Scala.js]: https://www.scala-js.org/
[Atom IDE]: https://ide.atom.io/
[Metals]: https://github.com/scalameta/metals
[LSP]: https://github.com/Microsoft/language-server-protocol
[Dotty]: http://dotty.epfl.ch/docs/usage/ide-support.html
[Ensime]: http://ensime.github.io/
