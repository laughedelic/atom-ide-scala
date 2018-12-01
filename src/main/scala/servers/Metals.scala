package laughedelic.atom.ide.scala

import scala.scalajs.js, js.annotation._
import laughedelic.atom.Atom
import laughedelic.atom.config._
import laughedelic.atom.languageclient.{ ActiveServer, ExecuteCommandParams }

@js.native @JSImport("minimatch", JSImport.Namespace)
object minimatch extends js.Object {
  def apply(path: String, pattern: String): Boolean = js.native
}

object Metals extends ScalaLanguageServer { server =>
  val name: String = "metals"
  val description: String = "Metals"
  val defaultVersion: String = "0.2.0-SNAPSHOT"

  def trigger(projectPath: String): Boolean = {
    (projectPath / ".metals").isDirectory
  }

  def watchFilter(filePath: String): Boolean = {
    minimatch(filePath, "**/*.{scala,sbt,java}") ||
    minimatch(filePath, "**/project/build.properties")
  }

  override def javaExtraArgs(projectPath: String): Seq[String] =
    Config.metals.javaArgs.get.toSeq ++ Seq(
      "-Dmetals.slow-task=status-bar",
      "-Dmetals.status-bar=on",
      "-Dmetals.file-watcher=custom",
      "-Dmetals.extensions=true",
      "-Dmetals.icons=atom",
    )

  def coursierArgs(projectPath: String): Seq[String] = Seq(
    s"org.scalameta:metals_2.12:${Config.metals.version.get}",
    "-r", "sonatype:snapshots", "-r", "bintray:scalacenter/releases",
    "--main", "scala.meta.metals.Main"
  )

  val commands = Seq(
    "build-import",
    "build-connect",
    "sources-scan",
  ).map { cmd =>
    cmd -> { activeServer: ActiveServer => _: js.Any =>
      activeServer.connection.executeCommand(
        new ExecuteCommandParams(command = cmd)
      )
    }
  }.toMap

  override def postInitialization(client: ScalaLanguageClient, activeServer: ActiveServer): Unit = {
    activeServer
      .connection
      .asInstanceOf[js.Dynamic]
      .onCustom("metals/status", { params: js.Dynamic =>
        client.statusBarTile.innerHTML = params.text.toString
      })

    Atom.workspace.onDidChangeActiveTextEditor { editorOrUndef =>
      for {
        editor <- editorOrUndef
        if client.shouldStartForEditor(editor)
        uri <- editor.getURI
      } yield {
        val fileUri = new java.net.URI("file", "", uri, null)
        activeServer
          .connection
          .asInstanceOf[js.Dynamic]
          .sendCustomNotification("metals/didFocusTextDocument", fileUri.toString)
      }
    }
  }

}

object MetalsConfig extends ConfigSchema {

  // These are custom settings for the Metals launcher
  val version = new Setting[String](
    title = "Metals version",
    description = "Set it to `SNAPSHOT` if you're working on Metals and publish it locally",
    default = Metals.defaultVersion,
  )

  val javaArgs = new Setting[js.Array[String]](
    title = "Extra JVM options",
    default = js.Array(
      "-XX:+UseG1GC",
      "-XX:+UseStringDeduplication",
      "-Xss4m",
      "-Xms1G",
      "-Xmx4G",
    )
  )

}
