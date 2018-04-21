package laughedelic.atom.ide.scala

import scala.scalajs.js, js.|, js.JSConverters._
import io.scalajs.nodejs.child_process.ChildProcess
import laughedelic.atom._
import laughedelic.atom.languageclient._
import scala.concurrent._, ExecutionContext.Implicits.global

class ScalaLanguageClient extends AutoLanguageClient { client =>
  // Constant values common for all servers
  override def getGrammarScopes(): js.Array[String] = js.Array("source.scala")
  override def getLanguageName(): String = "Scala"
  override def shouldStartForEditor(editor: TextEditor): Boolean =
    editor.getURI.map(_.endsWith(".scala")).getOrElse(false)
    // && (Config.autoServer.get || ScalaLanguageServer.defaultNonEmpty)

  // The rest depends on the chosen server
  private var server: ScalaLanguageServer = ScalaLanguageServer.fromConfig

  private def chooseServer(projectPath: String): Future[ScalaLanguageServer] = {
    val triggerred =
      if (Config.autoServer.get)
        ScalaLanguageServer.values.filter { _.trigger(projectPath) }
      else Nil

    triggerred match {
      case Nil if !Config.autoServer.get && !ScalaLanguageServer.defaultNonEmpty => {
        Atom.notifications.addError(
          "No Scala language server is selected",
          new NotificationOptions(
            description = "Automatic server selection is off and no default is chosen. Go to the [ide-scala settings](atom://settings-view/show-package?package=ide-scala) to fix it.",
            detail = projectPath,
            dismissable = true,
            icon = "mute",
          )
        )
        Future(ScalaLanguageServer.none)
      }

      case Nil => {
        val default = ScalaLanguageServer.fromConfig
        val title = "Project is not setup" ++ {
          if (default == ScalaLanguageServer.none) " for any Scala language server"
          else s", using default language server: **${default.name.capitalize}**"
        }
        Atom.notifications.addWarning(
          title,
          new NotificationOptions(
            description = "To learn how to setup new projects, follow the [documentation](https://github.com/laughedelic/atom-ide-scala#usage)",
            detail = projectPath,
            dismissable = true,
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
    chooseServer(projectPath).map {
      case ScalaLanguageServer.none =>
        throw new RuntimeException("Couldn't start server: project is not setup and default server is not chosen")
      case chosen =>
        server = chosen
        // `name` field is set early and then used in some UI elements (instead of
        // `getServerName`), we can update it here to fix, for example, logger console
        client.asInstanceOf[js.Dynamic]
          .updateDynamic("name")(server.name.capitalize)
        server.launch(projectPath)
    }.toJSPromise
  }

  private def camelToKebab(str: String) =
    "[A-Z]".r.replaceAllIn(str, { "-" + _.group(0).toLowerCase() })

  override def postInitialization(activeServer: ActiveServer): Unit = {
    activeServer
      .capabilities
      .executeCommandProvider
      .map(_.commands).getOrElse(js.Array())
      .foreach { cmd =>
        server.commands.get(cmd).foreach { handler =>
          Atom.commands.add(
            "atom-workspace",
            s"${server.name}:${camelToKebab(cmd)}",
            { node =>
              handler(activeServer)(node)
            }: js.Function1[js.Any, Unit]
          )
        }
      }

    Atom.commands.add(
      "atom-workspace",
      s"ide-scala:restart-all-language-servers",
      { _ =>
        client.restartAllServers()
      }: js.Function1[js.Any, Unit]
    )
  }

  override def getRootConfigurationKey(): String =
    s"ide-scala.${server.name}"

  override def mapConfigurationObject(configuration: js.Any): js.Any =
    // TODO: review when Dotty LS has a configuration
    js.Dynamic.literal(
      server.name -> configuration
    )
}
