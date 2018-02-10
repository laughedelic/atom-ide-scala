package laughedelic.atom.ide.scala

import scala.scalajs.js, js.|, js.Dynamic.global, js.annotation._, js.JSConverters._
import scala.concurrent.{ Future, ExecutionContext }
import io.scalajs.nodejs.child_process.{ ChildProcess, SpawnOptions }
import io.scalajs.nodejs.path.Path
import io.scalajs.nodejs.os.OS
import io.scalajs.nodejs.fs.Fs
import laughedelic.atom.{ Atom, NotificationOptions }
import laughedelic.atom.languageclient._
import laughedelic.atom.ide.ui.busysignal._

class ScalaLanguageClient extends AutoLanguageClient { client =>
  import ScalaLanguageClient._
  
  private lazy val server: ServerType = ServerType.fromConfig

  override def getGrammarScopes(): js.Array[String] = js.Array("source.scala")
  override def getLanguageName(): String = "Scala"
  override def getServerName(): String = server.name

  override def filterChangeWatchedFiles(filePath: String): Boolean =
    server.watchFilter(filePath)

  /** Checks config setting first, if it's empty tries to find Java Home or report an error */
  private def getJavaHome(implicit ec: ExecutionContext): Future[String] = {
    Future(Config.jvm.javaHome.get)
      .filter(_.nonEmpty)
      .fallbackTo(findJavaHome())
      .filter { javaHome =>
        // TODO: use accessSync
        Fs.existsSync(Path.join(javaHome, "bin", "java"))
      }
      .transform(
        identity[String], { th: Throwable =>
          Atom.notifications.addError(
            "Java Home is not found or is invalid. Try to set it explicitly in the plugin settings.",
            new NotificationOptions(
              dismissable = true,
              detail = client.name
            )
          )
          th
        }
      )
  }

  override def startServerProcess(projectPath: String): ChildProcess | js.Promise[ChildProcess] = {
    import ExecutionContext.Implicits.global
    getJavaHome.map { javaHome =>
      launchServer(javaHome, projectPath)
    }.toJSPromise
  }

  private def launchServer(javaHome: String, projectPath: String): ChildProcess = {
    val packagePath = global.atom.packages
      .getLoadedPackage("ide-scala")
      .path.asInstanceOf[String]
    val coursierJar = Path.join(packagePath, "coursier")

    val javaBin = Path.join(javaHome, "bin", "java")
    val javaArgs =
      server.javaArgs(projectPath) ++
      Config.jvm.javaOpts.get ++
      Seq(
        "-jar", coursierJar,
        "launch", "--quiet"
      ) ++
      server.coursierArgs(javaHome, Config.serverVersion.get)

    println((javaBin +: javaArgs).mkString("\n"))

    val serverProcess = ChildProcess.spawn(
      javaBin,
      javaArgs.toJSArray,
      new SpawnOptions(cwd = projectPath)
    )
    client.captureServerErrors(serverProcess)
    serverProcess
  }

  override def preInitialization(connection: LanguageClientConnection): Unit = {
    // NOTE: a workaround for repeating notifications (it should be fixed in atom-notifications)
    // On every new notification it goes through all matching old notifications and dismisses them.
    // We can do it only after the fact. Also we cannot dismiss the new one instead, because if some
    // old ones were dismissed manually, user won't see the new notifications.
    Atom.notifications.onDidAddNotification { newOne =>
      val notifications = Atom.notifications.getNotifications()
      val matching = notifications.filter { oldOne =>
        oldOne != newOne &&
        oldOne.getType() == newOne.getType() &&
        oldOne.getMessage() == newOne.getMessage()
      }
      matching.foreach { _.dismiss() }
    }
  }

  override def postInitialization(server: ActiveServer): Unit = {
    val serverSupportedCommands = server.capabilities.executeCommandProvider.map(_.commands.toSet).getOrElse(Set.empty)

    val commands = SupportedCommands.intersect(serverSupportedCommands)

    commands.foreach { cmd =>
      val cmdName = toAtomCommand(cmd)

      Atom.commands.add("atom-text-editor", s"ide-scala:${cmdName}", { _ =>
        server.connection.executeCommand(new ExecuteCommandParams(command = cmd))
      }: js.Function1[Any, Unit])
    }
  }
}

object ScalaLanguageClient {

  val ClearIndexCacheCommand = "clearIndexCache"
  val ResetPresentationCompilerCommand = "resetPresentationCompiler"
  val ScalafixUnusedImportsCommand = "scalafixUnusedImports"
  val SbtConnectCommand = "sbtConnect"

  val SupportedCommands = Set(
    ClearIndexCacheCommand,
    ResetPresentationCompilerCommand,
    SbtConnectCommand)

  // Transform from camelCase to camel-case
  val toAtomCommand = "[A-Z]".r.replaceAllIn(_: String, { "-" + _.group(0).toLowerCase() })
}
