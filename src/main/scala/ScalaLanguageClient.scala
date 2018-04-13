package laughedelic.atom.ide.scala

import scala.scalajs.js, js.|
import io.scalajs.nodejs.child_process.ChildProcess
import laughedelic.atom.{ Atom, TextEditor }
import laughedelic.atom.languageclient._

class ScalaLanguageClient extends AutoLanguageClient { client =>

  private lazy val server: ScalaLanguageServer = ScalaLanguageServer.fromConfig
  private lazy val serverID: String = server.name.toLowerCase

  override def getGrammarScopes(): js.Array[String] = js.Array("source.scala")
  override def getLanguageName(): String = "Scala"
  override def getServerName(): String = server.name
  override def shouldStartForEditor(editor: TextEditor): Boolean =
    editor.getURI.map(_.endsWith(".scala")).getOrElse(false)

  override def filterChangeWatchedFiles(filePath: String): Boolean =
    server.watchFilter(filePath)

  override def startServerProcess(
    projectPath: String
  ): ChildProcess | js.Promise[ChildProcess] = {
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
            s"${serverID}:${camelToKebab(cmd)}",
            { node =>
              handler(activeServer)(node)
            }: js.Function1[js.Any, Unit]
          )
        }
      }
  }

  override def getRootConfigurationKey(): String =
    s"ide-scala.${serverID}"

  override def mapConfigurationObject(configuration: js.Any): js.Any =
    // TODO: review when Dotty LS has a configuration
    js.Dynamic.literal(
      serverID -> configuration
    )
}
