# Atom IDE Scala language client

[![](https://travis-ci.org/laughedelic/atom-ide-scala.svg?branch=master)](https://travis-ci.org/laughedelic/atom-ide-scala)
[![](https://img.shields.io/github/release/laughedelic/atom-ide-scala/all.svg)](https://github.com/laughedelic/atom-ide-scala/releases/latest)
[![](https://img.shields.io/apm/dm/ide-scala.svg)](https://atom.io/packages/ide-scala)
[![](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![](https://img.shields.io/badge/contact-gitter_chat-dd1054.svg)](https://gitter.im/laughedelic/atom-ide-scala)

Scala & Dotty support for [Atom IDE], powered by [Metals], [Dotty] and [Ensime] language servers.

![](https://user-images.githubusercontent.com/766656/34135911-aa78092a-e463-11e7-9fdf-710a8deb4093.png)

(The screenshot above is outdated, the set of features depends on the language server you're going to use)

#### 🚧 WORK IN PROGRESS 🚧

The project is in active development and may have some rough edges. You are welcome to try it out and provide any feedback in the [Gitter chat](https://gitter.im/laughedelic/atom-ide-scala) or [Github issues](https://github.com/laughedelic/atom-ide-scala/issues).

This plugin is written in **[Scala.js]**, so if you are a Scala developer looking for better development experience in Atom, you're encouraged to contribute. Check the [contributing guide](CONTRIBUTING.md) and [open issues](https://github.com/laughedelic/atom-ide-scala/issues) especially the ones marked with `help wanted` label.

The work of this plugin is to launch the language server and wire communication with it to the Atom IDE services. Most of the interesting stuff is happening on the server side, so check also the [scalameta/metals](https://github.com/scalameta/metals) project.

During development some reusable parts were split into separate repos:

* [scalajs-atom-api](https://github.com/laughedelic/scalajs-atom-api): Scala.js facades for Atom-related APIs (including atom-languageclient)
* [sbt-atom-package](https://github.com/laughedelic/sbt-atom-package): an sbt plugin wraping apm and simplifying development of Scala.js-based Atom plugins

## Installation

Open the [package page](https://atom.io/packages/ide-scala) and click the green _Install_ button. Or run this command:

```
apm install ide-scala
```

On the first launch it will automatically install its dependencies if needed:
+ [language-scala](https://github.com/atom-community/language-scala) for basic Scala syntax highlighting
+ [atom-ide-ui](https://github.com/facebook-atom/atom-ide-ui) for the Atom IDE interface

## Usage

This plugin can work with different Scala language servers: Metals for Scala 2 projects or Dotty for Scala 3 projects. The plugin tries to determine which server to launch depending on the project setup.

Plugin gets activated only when you open a `.scala` file.

> ⚠️ Notice that when you close all tabs with Scala files, language server will be stopped. See [atom-languageclient#141](https://github.com/atom/atom-languageclient/issues/141) for discussion on this behavior.

### [Metals]

Metals project setup is completely automatic: when you open a new project, it will ask you if you want to import the build definition. If something goes wrong or doesn't work as expected, run Metals Doctor through the command palette.

More details on the [Metals website](https://scalameta.org/metals/docs/editors/atom.html).

### [Dotty]

Setup a [Dotty sbt project](https://github.com/lampepfl/dotty-example-project) and run `sbt configureIDE` in it, then just open the project in Atom.

Official instructions may tell you to run `launchIDE` in sbt, but this command can only launch VS Code, so just use `configureIDE` instead and open the project in Atom.

### [Ensime]

🚧 Ensime support is removed for now because the LSP implementation of the Ensime server is quite unstable at the moment and Ensime is not actively maintained. So even if the client works well, the server might be broken and you won't see any features working. 🚧

Follow [ensime-server#1951](https://github.com/ensime/ensime-server/pull/1951) for more information and _get involved if you want to use Ensime LSP server_.


[Scala]: http://scala-lang.org/
[Scala.js]: https://www.scala-js.org/
[Atom IDE]: https://ide.atom.io/
[Metals]: https://github.com/scalameta/metals
[LSP]: https://github.com/Microsoft/language-server-protocol
[Dotty]: http://dotty.epfl.ch/docs/usage/ide-support.html
[Ensime]: http://ensime.github.io/
