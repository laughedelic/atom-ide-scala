package laughedelic.atom.ide.scala

import scala.scalajs.js, js.|, js.Dynamic.global, js.annotation._, js.JSConverters._
import scala.concurrent.{ Future, ExecutionContext }
import io.scalajs.nodejs.child_process.{ ChildProcess, SpawnOptions }
import io.scalajs.nodejs.path.Path
import io.scalajs.nodejs.os.OS
import io.scalajs.nodejs.fs.Fs
import laughedelic.atom.languageclient._
import laughedelic.atom.ide.ui.busysignal._

class ScalaLanguageClient extends AutoLanguageClient { client =>

  private lazy val server: ServerType = ServerType.fromConfig

  override def getGrammarScopes(): js.Array[String] = js.Array("source.scala")
  override def getLanguageName(): String = "Scala"
  override def getServerName(): String = server.name

  override def filterChangeWatchedFiles(filePath: String): Boolean =
    server.watchFilter(filePath)

  /** Checks config setting first, if it's empty tries to find Java Home or report an error */
  private def getJavaHome(implicit ec: ExecutionContext): Future[String] = {
    Future {
      global.atom.config.get("ide-scala.jvm.javaHome").asInstanceOf[String]
    }.filter(_.nonEmpty)
      .fallbackTo(findJavaHome())
      .filter { javaHome =>
        // TODO: use accessSync
        Fs.existsSync(Path.join(javaHome, "lib", "tools.jar")) &&
        Fs.existsSync(Path.join(javaHome, "bin", "java"))
      }
      .transform(
        identity[String], { th: Throwable =>
          global.atom.notifications.addError(
            "Java Home is not found or is invalid. Try to set it explicitly in the plugin settings.",
            js.Dynamic.literal(
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
    val toolsJar = Path.join(javaHome, "lib", "tools.jar")

    val packagePath = global.atom.packages
      .getLoadedPackage("ide-scala")
      .path.asInstanceOf[String]
    val coursierJar = Path.join(packagePath, "coursier")

    val serverVersion = global.atom.config.get("ide-scala.serverVersion").asInstanceOf[String]

    val javaBin = Path.join(javaHome, "bin", "java")
    val javaArgs =
      server.javaArgs(projectPath) ++
      global.atom.config.get("ide-scala.jvm.javaOpts").asInstanceOf[js.Array[String]] ++
      Seq(
        "-jar", coursierJar,
        "launch", "--quiet",
        "--extra-jars", toolsJar
      ) ++
      server.coursierArgs(serverVersion)

    println((javaBin +: javaArgs).mkString("\n"))

    val serverProcess = ChildProcess.spawn(
      javaBin,
      javaArgs.toJSArray,
      new SpawnOptions(cwd = projectPath)
    )
    client.captureServerErrors(serverProcess)
    serverProcess
  }

  override def preInitialization(connection: js.Any): Unit = {
    // NOTE: a workaround for repeating notifications (it should be fixed in atom-notifications)
    // On every new notification it goes through all matching old notifications and dismisses them.
    // We can do it only after the fact. Also we cannot dismiss the new one instead, because if some
    // old ones were dismissed manually, user won't see the new notifications.
    global.atom.notifications.onDidAddNotification({ notification: AtomNotification =>
      val notifications =
        global.atom.notifications.getNotifications().asInstanceOf[js.Array[AtomNotification]]
      val matching = notifications.filter { old =>
        old != notification &&
        old.getType() == notification.getType() &&
        old.getMessage() == notification.getMessage()
      }
      matching.foreach { _.dismiss() }
    })
  }
}

// An ad-hoc interface for the code Atom Notification type
// TODO: move it somewhere else
trait AtomNotification extends js.Object {
  def getType(): String
  def getMessage(): String
  def dismiss(): Unit
}
