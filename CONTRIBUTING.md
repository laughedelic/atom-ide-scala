# Contributing

Any kind of contributions are welcome:
* Participating in the discussions in the Gitter chat, issues or pull requests
* Improving documentation: updating, clarifying, extending it
* Submitting bug reports and bug fixes
* Proposing new features or general improvements

## Contribution Guidelines

* To submit a bug report or a feature request, open a new issue
* To propose a bug fix or a feature implementation, follow the standard [fork & pull-request](https://help.github.com/articles/about-pull-requests) process
* Before submitting a pull-request it's recommended to discuss the idea with maintainers, either via an issue or in the Gitter chat. This will help you to spend less time on the implementation and prepare a pull-request which is more likely to be merged
* All code pull-requests should:
    - have a meaningful commit message description
    - comment important things
    - include tests
    - minimize changes not related to the subject of the pull-request (like changing code formatting)

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

#### Every time you change the _plugin_ sources

1. Run `fullOptJS` in sbt
2. Reload the Atom window: <kbd>ctrl</kbd><kbd>cmd</kbd><kbd>alt</kbd><kbd>L</kbd>

#### Every time you change the _server_ sources

1. Run `metaserver/publishLocal` in the server sbt project
2. Restart the server.

You don't need to recompile the plugin. The plugin just needs to relaunch the server. You can achieve it by closing all tabs with Scala sources (it will stop the server) and opening one again (it will start a server using the newly published jar). You can still just reload the Atom window if you want.

#### Every time you want to test it on a new project

1. Setup [semanticdb-scalac](http://scalameta.org/tutorial/#sbt) plugin (see [`test-workspace`](https://github.com/scalameta/language-server/blob/master/test-workspace/build.sbt) project in the server repo for example)
2. Launch sbt and run `~compile` (or `~test:compile`)
3. Open Atom in development mode: `atom --dev .`


### Debugging

Open Developer Console with <kbd>cmd</kbd><kbd>alt</kbd><kbd>I</kbd>  and run there

```
atom.config.set('core.debugLSP', true)
```
(You need to do it just once)

Now you will see all communication between the client and language server.
