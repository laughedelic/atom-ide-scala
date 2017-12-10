package laughedelic.atom.ide.scala

import scala.scalajs.js, js.|, js.Dynamic.global, js.annotation._, js.JSConverters._
import scala.concurrent.{ Future, ExecutionContext }
import io.scalajs.nodejs.child_process.ChildProcess
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

    val serverProcess = ChildProcess.spawn(javaBin, js.Array(javaArgs: _*))
    client.captureServerErrors(serverProcess)
    serverProcess
  }

}
