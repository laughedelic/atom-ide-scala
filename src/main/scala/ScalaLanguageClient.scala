package laughedelic.atom.ide.scala

import scala.scalajs.js, js.|, js.JSConverters._
import org.scalajs.dom, dom.raw.Element
import io.scalajs.nodejs.child_process.ChildProcess
import laughedelic.atom._
import laughedelic.atom.languageclient._
import laughedelic.atom.ide.ui.statusbar._
import scala.concurrent._, ExecutionContext.Implicits.global

class ScalaLanguageClient extends AutoLanguageClient { client =>
  // Constant values common for all servers
  override def getGrammarScopes(): js.Array[String] = js.Array("source.scala")
  override def getLanguageName(): String = "Scala"
  override def shouldStartForEditor(editor: TextEditor): Boolean =
    editor.getURI.filter(_.endsWith(".scala")).nonEmpty

  // The rest depends on the chosen server
  private var server: ScalaLanguageServer = ScalaLanguageServer.fromConfig

  // Status bar tile which will show status updates from the language server
  val statusBarTile: Element = {
    val div = dom.document.createElement("div")
    div.classList.add("inline-block")
    div
  }


  private def chooseServer(projectPath: String): Future[ScalaLanguageServer] = {
    val triggerred =
      if (Config.autoServer.get)
        ScalaLanguageServer.values.filter { _.trigger(projectPath) }
      else Nil

    triggerred match {
      case Nil => {
        val default = ScalaLanguageServer.fromConfig
        Atom.notifications.addInfo(
          s"Project is not setup, using default language server: **${default.name.capitalize}**",
          new NotificationOptions(
            detail = projectPath,
            dismissable = false,
            icon = "plug",
          )
        )
        Future(default)
      }

      case List(newServer) => {
        val a = if (newServer == Ensime) "an" else "a"
        Atom.notifications.addSuccess(
          s"Looks like ${a} **${newServer.name.capitalize}** project, launching language server...",
          new NotificationOptions(
            detail = projectPath,
            dismissable = false,
            icon = "rocket",
          )
        )
        Future(newServer)
      }

      case multipleMatch => {
        val promise = Promise[ScalaLanguageServer]()
        val notification = Atom.notifications.addInfo(
          s"Ambiguous project setup",
          new NotificationOptions(
            description = s"Looks like this project is setup for several language servers, choose which one you want to launch:",
            detail = projectPath,
            dismissable = true,
            icon = "law",
            buttons = multipleMatch.toJSArray.map { newServer =>
              new NotificationButton(
                text = newServer.name.capitalize,
                onDidClick = { _ =>
                  promise.success(newServer)
                }: js.Function1[Unit, Unit]
              )
            },
          )
        )
        // TODO: add onDidDismiss to the Notification type (scalajs-atom-api)
        notification.asInstanceOf[js.Dynamic].onDidDismiss(
          { _ =>
            if (!promise.isCompleted)
              promise.success(ScalaLanguageServer.fromConfig)
          }: js.Function1[Unit, Unit]
        )
        promise.future.andThen {
          case _ => notification.dismiss()
        }
      }
    }
  }

  override def getServerName(): String =
    server.name.capitalize

  override def filterChangeWatchedFiles(filePath: String): Boolean =
    server.watchFilter(filePath)

  override def startServerProcess(
    projectPath: String
  ): ChildProcess | js.Promise[ChildProcess] = {
    chooseServer(projectPath).map { chosen =>
        server = chosen
        // `name` field is set early and then used in some UI elements (instead of
        // `getServerName`), we can update it here to fix, for example, logger console
        client.asInstanceOf[js.Dynamic]
          .updateDynamic("name")(server.name.capitalize)
        server.launch(projectPath)
    }.toJSPromise
  }

  private def addServerCommands(activeServer: ActiveServer): Unit = {
    def capitalizeWords(str: String): String =
      str.split("\\s+").map(_.capitalize).mkString(" ")

    def displayName(category: String, name: String): String =
      s"${capitalizeWords(category)}: ${capitalizeWords(name)}"

    // What we got from the server on initialization
    val declaredCommands = activeServer
      .capabilities
      .executeCommandProvider
      .map(_.commands).getOrElse(js.Array())

    // What we are aware of
    val knownCommands = server.commands

    for {
      cmd <- declaredCommands
      title <- knownCommands.get(cmd)
    } yield {
      Atom.commands.add(
        target = "atom-workspace",
        commandName = s"${server.name}:${cmd}",
        new CommandListener(
          displayName = displayName(server.name, title)
        )({ node =>
            activeServer.connection.executeCommand(
              new ExecuteCommandParams(command = cmd)
            )
          }: js.Function1[js.Any, Unit]
        )
      )
    }

    // An additional command implemented through the atom-languageclient API
    Atom.commands.add(
      target = "atom-workspace",
      commandName = s"${server.name}:restart-server",
      new CommandListener(
        displayName = displayName(server.name, "Restart Server")
      )({ _ =>
          client.restartAllServers()
        }: js.Function1[js.Any, Unit]
      )
    )
  }

  override def postInitialization(activeServer: ActiveServer): Unit = {
    addServerCommands(activeServer)
    server.postInitialization(client, activeServer)
  }

  override def getRootConfigurationKey(): String =
    s"ide-scala.${server.name}"

  override def mapConfigurationObject(configuration: js.Any): js.Any = {
    // TODO: review when Dotty LS has a configuration
    if (server == Metals) {
      js.Dynamic.literal(
        server.name -> configuration
      )
    } else null
  }

  def consumeStatusBar(statusBar: StatusBarView): Unit = {
    statusBar.addRightTile(new StatusTileOptions(
      item = client.statusBarTile
    ))
  }
}
