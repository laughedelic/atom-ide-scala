package laughedelic.atom.ide.scala

import scala.scalajs.js, js.|, js.Dynamic.global, js.annotation._, js.JSConverters._
import io.scalajs.nodejs.child_process.ChildProcess
import io.scalajs.nodejs.path.Path
import io.scalajs.nodejs.os.OS
import facade.atom_languageclient._
import facade.atom_ide.busy_signal._

class ScalaLanguageClient extends AutoLanguageClient { client =>

  private lazy val server: ServerType = ServerType.fromConfig

  override def getGrammarScopes(): js.Array[String] = js.Array("source.scala")
  override def getLanguageName(): String = "Scala"
  override def getServerName(): String = server.name

  private def launchServer(javaHome: String, projectPath: String): ChildProcess = {
    val toolsJar = Path.join(javaHome, "lib", "tools.jar")

    val packagePath = global.atom.packages
      .getLoadedPackage("ide-scala")
      .path.asInstanceOf[String]
    val coursierJar = Path.join(packagePath, "coursier")

    val javaBin = Path.join(javaHome, "bin", "java")
    val javaArgs =
      server.javaArgs(projectPath) ++
      Seq(
        "-jar", coursierJar,
        "launch", "--quiet",
        "--extra-jars", toolsJar
      ) ++
      server.coursierArgs

    println((javaBin +: javaArgs).mkString("\n"))

    val serverProcess = ChildProcess.spawn(javaBin, js.Array(javaArgs: _*))
    client.captureServerErrors(serverProcess)
    serverProcess.on("exit", { err: js.Any =>
      busySignal.clear()
      client.handleSpawnFailure(client.processStdErr)
    })
    serverProcess
  }

  override def startServerProcess(projectPath: String): ChildProcess | js.Promise[ChildProcess] = {
    import scala.concurrent.ExecutionContext.Implicits.global
    findJavaHome(allowJre = true).map { javaHome =>
      launchServer(javaHome, projectPath)
    }.toJSPromise
  }

  override def filterChangeWatchedFiles(filePath: String): Boolean = {
    server.watchFilter(filePath)
  }

  override def preInitialization(connection: js.Any): Unit = {
    busySignal.update(
      text = "initializing language server...",
      init = true,
      reveal = false
    )
  }

  override def postInitialization(server: js.Any): Unit = {
    busySignal.clear()
  }

  // Is there any better way to consume this service?
  private var busySignal: BusySignal = null
  def consumeBusySignal(service: BusySignalService): Unit = {
    client.busySignal = BusySignal(service, client.getServerName)
  }

}
