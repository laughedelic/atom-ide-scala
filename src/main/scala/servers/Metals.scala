package laughedelic.atom.ide.scala

import scala.scalajs.js, js.annotation._
import org.scalajs.dom, dom.raw.Element
import laughedelic.atom.Atom
import laughedelic.atom.config._
import laughedelic.atom.languageclient.{ActiveServer, LanguageClientConnection}
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
  val defaultVersion: String = "0.6.1"

  def trigger(projectPath: String): Boolean = {
    (projectPath / ".metals").isDirectory
  }

  def watchFilter(filePath: String): Boolean = {
    minimatch(filePath, "**/*.{scala,sbt,java}") ||
    minimatch(filePath, "**/project/build.properties")
  }

  override def javaExtraArgs(projectPath: String): Seq[String] =
    Config.metals.`java-args`.get.toSeq ++ Seq(
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

    // HtmlView needs to be registered so that Atom knows how to render it
    Atom.asInstanceOf[js.Dynamic]
      .views
      .addViewProvider( { _.getViewClass }: js.Function1[HtmlView, Element] )

    // Here we can use activeServer.connection to attach callbacks for custom LSP messages
    activeServer.connection.asInstanceOf[js.Dynamic]
      .onCustom("metals/status", { params: js.Dynamic =>
        Atom.workspace.getActiveTextEditor().foreach { editor =>
          if (client.isFileInProject(editor, projectPath)) {
            client.statusBarTile.innerHTML = params.text.toString
          }
        }
      })
    activeServer.connection.asInstanceOf[js.Dynamic]
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

    // activeServer.connection will be disposed, so we need to ask for the active connection on demand
    def withActiveConnection(action: LanguageClientConnection => Unit): Unit = {
      Atom.workspace.getActiveTextEditor()
        .filter(client.shouldStartForEditor)
        .foreach { editor =>
          client
            .getConnectionForEditor(editor).toFuture
            .foreach { connectionOrUndef =>
              connectionOrUndef.foreach(action)
            }
        }
    }

    // Send windowStateDidChange notification to Metals every time window is in/out of focus
    Atom.asInstanceOf[js.Dynamic].getCurrentWindow()
      .on("focus", { _: js.Any =>
        withActiveConnection { connection =>
          connection.asInstanceOf[js.Dynamic].sendCustomNotification(
            "metals/windowStateDidChange",
            js.Dynamic.literal("focused" -> true)
          )
        }
      })
      .on("blur", { _: js.Any =>
        withActiveConnection { connection =>
          connection.asInstanceOf[js.Dynamic].sendCustomNotification(
            "metals/windowStateDidChange",
            js.Dynamic.literal("focused" -> false)
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

  val `scalafmt-config-path` = new Setting[String](
    title = "Scalafmt configuration",
    description = "Should be relative to the workspace root directory and use forward slashes `/` for file separators (even on Windows).",
    default = ".scalafmt.conf",
  )

  val `java-home` = new Setting[String](
    title = "Java Home directory",
    description = "The Java Home directory used for indexing JDK sources and locating the `java` binary. Metals will try to detect this setting automatically, but you can override it here if you need more flexibility.",
    default = "",
  )

  val `java-args` = new Setting[js.Array[String]](
    title = "Extra JVM options",
    default = js.Array(
      "-XX:+UseG1GC",
      "-XX:+UseStringDeduplication",
      "-Xss4m",
      "-Xms100m",
    )
  )

  val `sbt-script` = new Setting[String](
    title = "sbt script",
    description = "Optional absolute path to an `sbt` executable to use for running `sbt bloopInstall`. By default, Metals uses `java -jar sbt-launch.jar` with an embedded launcher while respecting `.jvmopts` and `.sbtopts`. Update this setting if your `sbt` script requires more customizations like using environment variables.",
    default = "",
  )

  val `gradle-script` = new Setting[String](
    title = "gradle script",
    description = "Optional absolute path to a `gradle` executable to use for running `gradle bloopInstall`. By default, Metals uses gradlew with 5.3.1 gradle version. Update this setting if your `gradle` script requires more customizations like using environment variables.",
    default = "",
  )

  val `maven-script` = new Setting[String](
    title = "maven script",
    description = "Optional absolute path to a `maven` executable to use for generating bloop config. By default, Metals uses `mvnw` maven wrapper with 3.6.1 maven version.. Update this setting if your `maven` script requires more customizations.",
    default = "",
  )

  val `mill-script` = new Setting[String](
    title = "mill script",
    description = "Optional absolute path to a `mill` executable to use for running `mill mill.contrib.Bloop/install`. By default, Metals uses mill wrapper script with 0.4.0 mill version. Update this setting if your `mill` script requires more customizations like using environment variables.",
    default = "",
  )

}
