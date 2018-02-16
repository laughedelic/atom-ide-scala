# Development

You will need [sbt](http://www.scala-sbt.org/download.html) (which you should have if you work with Scala) and [apm](https://github.com/atom/apm) (which comes together with Atom).

If you're going to experiment with the server as well follow server [setup instructions](https://github.com/scalameta/language-server/blob/master/CONTRIBUTING.md). And once you installed the plugin change server version in the plugin settings to the one you are going to publish locally (should be `0.1-SNAPSHOT`).

## General setup

1. First check the [requirements](README.md#installation) and uninstall the plugin if you already had it
    ```
    apm uninstall ide-scala
    ```

2. Now you should install this plugin locally in one of the two ways:
    * If you already forked it, clone your fork and run
        ```
        apm link --dev
        ```
    * Otherwise, use
        ```
        apm develop ide-scala [<where_you_want_to_clone_it>]
        ```

        This will

        > Clone the given package's Git repository to the directory specified, install its dependencies, and link it for development to ~/.atom/dev/packages/<package_name>.
        >
        > If no directory is specified then the repository is cloned to ~/github/<package_name>.

    You can check linked plugin repos with the `apm linked` command.

    **Note:** this won't install the plugin yet, because the cloned repo doesn't contain the plugin JavaScript file. You need to compile it first. See instructions below.

## Development cycle

1. After you setup the server and plugin repository, you need to compile the Scala.js to JavaScript which Atom will use to load the plugin. In the plugin repository:

    ```
    sbt package
    ```

    It will generate `package.json` and `lib/main.js`.

    First time you also need to run `apm install` to install node modules.

2. Now you can go to any test Scala project and open Atom in development mode:

    ```
    atom --dev .
    ```

    Or use <kbd>cmd</kbd><kbd>shift</kbd><kbd>O</kbd> hotkey in a running Atom instance.

#### Every time you change the _plugin_ sources

1. Run `package` in sbt
2. Reload the Atom window: <kbd>ctrl</kbd><kbd>cmd</kbd><kbd>alt</kbd><kbd>L</kbd>

#### Every time you change the _server_ sources

1. Run `publishLocal` in the server sbt project
2. Check that plugin settings refer to the server version that you just published
3. Restart the server

You don't need to recompile the plugin. The plugin just needs to relaunch the server.
You can achieve it by closing all tabs with Scala sources (it will stop the server) and opening one again (it will start a server using the newly published jar). You can still just reload the Atom window if you want, but it will take more time.

#### Every time you want to test it on a new project

1. Setup [semanticdb-scalac](http://scalameta.org/tutorial/#sbt) plugin (see [`test-workspace`](https://github.com/scalameta/language-server/blob/master/test-workspace/build.sbt) project in the server repo for example)
2. Launch sbt and run `~compile` (or `~test:compile`)
3. Open Atom in development mode: `atom --dev .`

Check server [beta testing instructions](https://github.com/scalameta/language-server/blob/master/BETA.md) for more details.

## Debugging

### LSP communication

Open Developer Console with <kbd>cmd</kbd><kbd>alt</kbd><kbd>I</kbd>  and run there

```
atom.config.set('core.debugLSP', true)
```
(You need to do it just once)

Now you will see all LSP communication in this console.

### Server logs

You can see more detailed logs from the server in `.metals/metals.log`.
