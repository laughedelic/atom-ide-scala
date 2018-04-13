package laughedelic.atom.ide.scala

import scala.scalajs.js, js.|
import io.scalajs.nodejs.child_process.ChildProcess
import laughedelic.atom.{ Atom, TextEditor, NotificationOptions }
import laughedelic.atom.languageclient._

class ScalaLanguageClient extends AutoLanguageClient { client =>
  // Constant values common for all servers
  override def getGrammarScopes(): js.Array[String] = js.Array("source.scala")
  override def getLanguageName(): String = "Scala"
  override def shouldStartForEditor(editor: TextEditor): Boolean =
    editor.getURI.map(_.endsWith(".scala")).getOrElse(false)

  // The rest depends on the chosen server
  private var server: ScalaLanguageServer = ScalaLanguageServer.dummy

  private def setServer(projectPath: String) = {
    Seq(
      Dotty,
      Metals,
      Ensime,
    ).find { _.trigger(projectPath) } match {
      case None => {
        val default = ScalaLanguageServer.fromConfig
        Atom.notifications.addWarning(
          s"This project is not setup, using default server: ${default.name.capitalize}",
          new NotificationOptions(dismissable = false)
          // TODO: add buttons and let user choose
        )
        // Probably it's better to send user to the usage docs and not launch any
        // server if project is not setup
        server = default
      }
      case Some(newServer) => {
        Atom.notifications.addInfo(
          s"Looks like a ${newServer.name.capitalize} project, launching server",
          new NotificationOptions(dismissable = false)
        )
        server = newServer
      }
    }
    // `name` field is set early and then used in some UI elements (instead of
    // `getServerName`), we can update it here to fix, for example, logger console
    client.asInstanceOf[js.Dynamic].updateDynamic("name")(server.name.capitalize)
  }

  override def getServerName(): String =
    server.name.capitalize

  override def filterChangeWatchedFiles(filePath: String): Boolean =
    server.watchFilter(filePath)

  override def startServerProcess(
    projectPath: String
  ): ChildProcess | js.Promise[ChildProcess] = {
    if (Config.autoServer.get) setServer(projectPath)
    server.launch(projectPath)
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
            "atom-text-editor",
            s"${server.name}:${camelToKebab(cmd)}",
            { node =>
              handler(activeServer)(node)
            }: js.Function1[js.Any, Unit]
          )
        }
      }
  }

  override def getRootConfigurationKey(): String =
    s"ide-scala.${server.name}"

  override def mapConfigurationObject(configuration: js.Any): js.Any =
    // TODO: review when Dotty LS has a configuration
    js.Dynamic.literal(
      server.name -> configuration
    )
}
