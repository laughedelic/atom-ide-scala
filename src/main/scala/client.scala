package laughedelic.atom.ide.scala

import scala.scalajs.js, js.annotation._, js.Dynamic.global
import io.scalajs.nodejs.child_process.ChildProcess
import io.scalajs.nodejs.path.Path
import io.scalajs.nodejs.os.OS
import facade.atom_languageclient._

object Exports {
  @JSExportTopLevel("client")
  val client = new ScalaLanguageClient()

  @JSExportTopLevel("activate")
  def activate(): Unit = client.activate()

  @JSExportTopLevel("deactivate")
  def deactivate(): Unit = client.deactivate()
}

class ScalaLanguageClient extends AutoLanguageClient {

  override def getGrammarScopes(): js.Array[String] = js.Array("source.scala")
  override def getLanguageName(): String = "Scala"
  override def getServerName(): String = "Scalameta"

  override def startServerProcess(projectPath: String): ChildProcess = {
    global.console.log(s"startServerProcess(${projectPath})")

    // FIXME: use more civilized way of detecting JAVA_HOME
    val javaHome = ChildProcess.asInstanceOf[js.Dynamic].execSync("/usr/libexec/java_home").toString.trim
    val toolsJar = Path.join(javaHome, "lib", "tools.jar")

    // TODO: try to use coursier directly
    val coursierJar = Path.join(OS.homedir, "bin", "coursier")
    val coursierArgs = js.Array(
      "launch", "--quiet",
      "--repository", "bintray:dhpcs/maven",
      "--repository", "sonatype:releases",
      "--extra-jars", toolsJar,
      "org.scalameta:metaserver_2.12:0.1-SNAPSHOT",
      "--main", "scala.meta.languageserver.Main"
    )

    val javaBin = Path.join(javaHome, "bin", "java")
    val javaArgs = js.Array(
      s"-Dvscode.workspace=${projectPath}",
      "-jar", coursierJar
    ).concat(coursierArgs)

    global.console.log(javaArgs.mkString(javaBin, "\n", ""))

    val serverProcess = ChildProcess.spawn(javaBin, javaArgs)
    this.captureServerErrors(serverProcess)
    serverProcess.on("exit", { err: js.Any =>
      this.handleSpawnFailure(this.processStdErr)
    })
    serverProcess
  }

  def filterChangeWatchedFiles(filePath: String): Boolean = {
    filePath.endsWith(".semanticdb") ||
    filePath.endsWith(".compilerconfig")
  }

}
