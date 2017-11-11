import scala.scalajs.js
import scala.scalajs.js.annotation._
import js.Dynamic.global
import io.scalajs.nodejs.child_process._

@js.native
@JSImport("atom-languageclient", "AutoLanguageClient")
class AutoLanguageClient extends js.Object {
  def activate(): Unit = js.native
  def deactivate(): Unit = js.native

  def getGrammarScopes(): js.Array[String] = js.native
  def getLanguageName(): String = js.native
  def getServerName(): String = js.native
  def startServerProcess(projectPath: String): ChildProcess = js.native
}

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
  override def getServerName(): String = "Scala"

  override def startServerProcess(projectPath: String): ChildProcess = {
    global.console.log(s"startServerProcess(${projectPath})")

    ChildProcess.spawn("node", js.Array("--version"))
  }
}
