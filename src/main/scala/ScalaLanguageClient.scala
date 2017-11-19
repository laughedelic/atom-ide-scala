package laughedelic.atom.ide.scala

import scala.scalajs.js, js.annotation._, js.Dynamic.global
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

  override def startServerProcess(projectPath: String): ChildProcess = {
    // FIXME: use more civilized way of detecting JAVA_HOME
    val javaHome = ChildProcess.asInstanceOf[js.Dynamic].execSync("/usr/libexec/java_home").toString.trim
    val toolsJar = Path.join(javaHome, "lib", "tools.jar")

    // TODO: try to use coursier directly
    val coursierJar = Path.join(OS.homedir, "bin", "coursier")
    val coursierArgs = Seq(
      "launch", "--quiet",
      "--extra-jars", toolsJar
    ) ++ server.coursierArgs

    val javaBin = Path.join(javaHome, "bin", "java")
    val javaArgs = Seq(
      "-Xmx4G", // heap size
      s"-Dvscode.workspace=${projectPath}",
      // TODO: add log level to the plugin settings
      s"-Dvscode.logLevel=DEBUG",
      "-jar", coursierJar
    ) ++ coursierArgs

    println((javaBin +: javaArgs).mkString("\n"))

    val serverProcess = ChildProcess.spawn(javaBin, js.Array(javaArgs: _*))
    client.captureServerErrors(serverProcess)
    serverProcess.on("exit", { err: js.Any =>
      busySignal.clear()
      client.handleSpawnFailure(client.processStdErr)
    })
    serverProcess
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
