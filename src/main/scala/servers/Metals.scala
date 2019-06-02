package laughedelic.atom.ide.scala

import scala.scalajs.js, js.annotation._
import org.scalajs.dom, dom.raw.Element
import laughedelic.atom.Atom
import laughedelic.atom.config._
import laughedelic.atom.languageclient.ActiveServer
import scala.concurrent._, ExecutionContext.Implicits.global

// For matching glob patterns
@js.native @JSImport("minimatch", JSImport.Namespace)
object minimatch extends js.Object {
  def apply(path: String, pattern: String): Boolean = js.native
}

// For rendering Metals Doctor output
class HtmlView(title: String) extends js.Object {
  // any view that will be open in a tab needs to have a title
  def getTitle(): String = title

  lazy val div = dom.document.createElement("div")

  def getViewClass(): Element = div
}

object Metals extends ScalaLanguageServer { server =>
  val name: String = "metals"
  val description: String = "Metals"
  val defaultVersion: String = "0.5.2"

  def trigger(projectPath: String): Boolean = {
    (projectPath / ".metals").isDirectory
  }

  def watchFilter(filePath: String): Boolean = {
    minimatch(filePath, "**/*.{scala,sbt,java}") ||
    minimatch(filePath, "**/project/build.properties")
  }

  override def javaExtraArgs(projectPath: String): Seq[String] =
    Config.metals.javaArgs.get.toSeq ++ Seq(
      "-Dmetals.extensions=true",
      "-Dmetals.slow-task=status-bar",
      "-Dmetals.status-bar=on",
      "-Dmetals.execute-client-command=on",
      "-Dmetals.icons=atom",
      "-Dmetals.signature-help-command='signature-help:view'",
      "-Dmetals.completion.command='autocomplete-plus:activate'",
      // "-Dmetals.override-def-format=unicode",
    )

  def coursierArgs(projectPath: String): Seq[String] = Seq(
    s"org.scalameta:metals_2.12:${Config.metals.version.get}",
    "-r", "sonatype:snapshots", "-r", "bintray:scalacenter/releases",
    "--main", "scala.meta.metals.Main"
  )

  val commands = Map(
    "build-import" -> "Import build",
    "build-connect" -> "Connect to build server",
    "sources-scan" -> "Rescan sources",
    "doctor-run" -> "Run doctor",
    "compile-cascade" -> "Cascade compile",
    "compile-cancel" -> "Cancel compilation",
    "bsp-switch" -> "Switch build server",
  )

  lazy val doctorView = new HtmlView("Metals Doctor")

  override def postInitialization(client: ScalaLanguageClient, activeServer: ActiveServer): Unit = {
    val projectPath = activeServer.projectPath
    val connection = activeServer.connection.asInstanceOf[js.Dynamic]

    connection
      .onCustom("metals/status", { params: js.Dynamic =>
        Atom.workspace.getActiveTextEditor().foreach { editor =>
          if (client.isFileInProject(editor, projectPath)) {
            client.statusBarTile.innerHTML = params.text.toString
          }
        }
      })

    // HtmlView needs to be registered so that Atom knows how to render it
    Atom.asInstanceOf[js.Dynamic]
      .views
      .addViewProvider(
        { _.getViewClass }: js.Function1[HtmlView, Element]
      )

    connection
      .onCustom("metals/executeClientCommand", { params: js.Dynamic =>
        params.command.toString match {
          case "metals-logs-toggle" =>
            dispatchAtomCommand("console:toggle")
          case "metals-diagnostics-focus" =>
            dispatchAtomCommand("diagnostics:toggle-table")
          case "metals-doctor-reload" =>
            doctorView.div.innerHTML = params.arguments.toString
          case "metals-doctor-run" => {
            doctorView.div.innerHTML = params.arguments.toString
            Atom.workspace.asInstanceOf[js.Dynamic]
              .getCenter()
              .getActivePane()
              .activateItem(doctorView, js.Dynamic.literal(pending = true))
          }
          case _ => client.logger.warn(
            s"Uknown Metals client command: ${js.JSON.stringify(params)}"
          )
        }
      })

    Atom.workspace.onDidChangeActiveTextEditor { editorOrUndef =>
      for {
        editor <- editorOrUndef
        if client.shouldStartForEditor(editor)
        uri <- editor.getURI
      } yield {
        // send didFocusTextDocument notification to Metals
        client
          .getConnectionForEditor(editor).toFuture
          .foreach { connectionOrUndef =>
            connectionOrUndef.foreach { connection =>
              val fileUri = new java.net.URI("file", "", uri, null)
              connection.asInstanceOf[js.Dynamic]
                .sendCustomNotification(
                  "metals/didFocusTextDocument",
                  fileUri.toString
                )
            }
          }
      }

      // Remove status when switching to unrelated tabs
      val shouldSync = editorOrUndef.filter { editor =>
        client.isFileInProject(editor, projectPath)
      }.nonEmpty
      if (!shouldSync) {
        client.statusBarTile.innerHTML = ""
      }
    }
  }

}

object MetalsConfig extends ConfigSchema {

  // These are custom settings for the Metals launcher
  val version = new Setting[String](
    title = "Metals version",
    default = Metals.defaultVersion,
  )

  val javaArgs = new Setting[js.Array[String]](
    title = "Extra JVM options",
    default = js.Array(
      "-XX:+UseG1GC",
      "-XX:+UseStringDeduplication",
      "-Xss4m",
      "-Xms100m",
    )
  )

}
