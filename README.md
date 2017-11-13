# Atom IDE Scala language client

[![](https://img.shields.io/github/release/laughedelic/atom-ide-scala/all.svg)](https://github.com/laughedelic/atom-ide-scala/releases/latest)
[![](https://img.shields.io/badge/license-LGPLv3-blue.svg)](https://www.tldrlegal.com/l/lgpl-3.0)
[![](https://img.shields.io/badge/contact-gitter_chat-dd1054.svg)](https://gitter.im/laughedelic/atom-ide-scala)

Scala language support for [Atom IDE], powered by [Scalameta language server].

----

#### 🚧 WORK IN PROGRESS 🚧

This project is in very early stage and is not ready for daily usage yet. Nevertheless you are welcome to try it out and provide any feedback either in the [Gitter chat](https://gitter.im/laughedelic/atom-ide-scala) or [Github issues](https://github.com/laughedelic/atom-ide-scala/issues).

----

This Atom plugin is written in [Scala.js] and is in active development, so if you are a Scala developer looking for a better Scala development experience in Atom, you're encouraged to contribute.

This plugin doesn't do much, it just launches server and wires communication with it to the Atom IDE UI services. All the interesting stuff is happening on the server side, so check also the server repository: [scalameta/language-server](https://github.com/scalameta/language-server).

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


## Development

You will need [sbt](http://www.scala-sbt.org/download.html) (which you should have if you work with Scala) and [apm](https://github.com/atom/apm) (which comes together with Atom).

### General setup

1. First, you need to [setup the server](https://github.com/scalameta/language-server/blob/master/CONTRIBUTING.md). ⚠️ **Without server nothing will work** ⚠️
    It's not published anywhere yet, so you will have to clone server project and publish it locally. Follow linked instructions in the server repository and skip things related to VS Code.

2. Next, you should install this plugin locally (and first uninstall it if you already had it):

    ```
    apm uninstall ide-scala
    apm develop ide-scala [<where_you_want_to_clone_it>]
    ```

    This will

    > Clone the given package's Git repository to the directory specified, install its dependencies, and link it for development to ~/.atom/dev/packages/<package_name>.
    >
    > If no directory is specified then the repository is cloned to ~/github/<package_name>.

    You can check linked plugin repos with the `apm linked` command.

    **Note:** this won't install the plugin yet, because the cloned repo doesn't contain the plugin JavaScript file. You need to compile it first. See instructions below.

### Development cycle

1. After you setup the server and plugin repository, you need to compile the Scala.js to JavaScript which Atom will use to load the plugin. In the plugin repository:

    ```
    sbt fullOptJS
    ```

    It will generate a file in `target/scala-2.12/atom-ide-scala-opt.js` which is referred in `package.json` as the entry point to plugin.

2. Now you can go to any test Scala project and open Atom in development mode:

    ```
    atom --dev .
    ```

    Or use <kbd>cmd</kbd><kbd>shift</kbd><kbd>O</kbd> hotkey in a running Atom.

##### Every time you change the _plugin_ sources

1. Run `fullOptJS` in sbt
2. Reload the Atom window: <kbd>ctrl</kbd><kbd>cmd</kbd><kbd>alt</kbd><kbd>L</kbd>

##### Every time you change the _server_ sources

1. Run `metaserver/publishLocal` in the server sbt project
2. Restart the server.

You don't need to recompile the plugin. The plugin just needs to relaunch the server. You can achieve it by closing all tabs with Scala sources (it will stop the server) and opening one again (it will start a server using the newly published jar). You can still just reload the Atom window if you want.

##### Every time you want to test it on a new project

1. Setup [semanticdb-scalac](http://scalameta.org/tutorial/#sbt) plugin (see [`test-workspace`](https://github.com/scalameta/language-server/blob/master/test-workspace/build.sbt) project in the server repo for example)
2. Launch sbt and run `~compile` (or `~test:compile`)
3. Open Atom in development mode: `atom --dev .`


#### Debugging

Open Developer Console with <kbd>cmd</kbd><kbd>alt</kbd><kbd>I</kbd>  and run there

```
atom.config.set('core.debugLSP', true)
```
(You need to do it just once)

Now you will see all communication between the client and language server.


[Scala]: http://scala-lang.org/
[Scala.js]: https://www.scala-js.org/
[Atom IDE]: https://ide.atom.io/
[Scalameta language server]: https://github.com/scalameta/language-server
[LSP]: https://github.com/Microsoft/language-server-protocol
