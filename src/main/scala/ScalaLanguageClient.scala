package laughedelic.atom.ide.scala

import scala.scalajs.js, js.|
import io.scalajs.nodejs.child_process.ChildProcess
import laughedelic.atom.{ Atom, TextEditor }
import laughedelic.atom.languageclient._

class ScalaLanguageClient extends AutoLanguageClient { client =>
  import ScalaLanguageClient._

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

  override def postInitialization(activeServer: ActiveServer): Unit = {
    val serverSupportedCommands = activeServer
      .capabilities
      .executeCommandProvider
      .map(_.commands.toSet)
      .getOrElse(Set.empty)
    val commands = supportedCommands.intersect(serverSupportedCommands)
    commands.foreach { cmd =>
      Atom.commands.add(
        "atom-text-editor",
        s"${serverID}:${toAtomCommand(cmd)}",
        { _ =>
          activeServer.connection.executeCommand(
            new ExecuteCommandParams(command = cmd)
          )
        }: js.Function1[Any, Unit])
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

object ScalaLanguageClient {
  val supportedCommands = Set(
    "clearIndexCache",
    "resetPresentationCompiler",
    "sbtConnect",
    // "scalafixUnusedImports",
  )

  // Transform from camelCase to camel-case
  val toAtomCommand = "[A-Z]".r.replaceAllIn(_: String, { "-" + _.group(0).toLowerCase() })
}
