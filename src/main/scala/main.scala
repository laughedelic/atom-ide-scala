import scala.scalajs.js
import scala.scalajs.js.annotation._
import js.Dynamic.{global => g}
import js.DynamicImplicits._

@js.native
@JSImport("atom-languageclient", "AutoLanguageClient")
class AutoLanguageClient extends js.Object {
  def activate(): Unit = js.native
  def deactivate(): Unit = js.native
}

class ScalaLanguageClient extends AutoLanguageClient {

  def getGrammarScopes(): js.Array[String] = {
    g.console.log("getGrammarScopes")
    return js.Array("source.scala")
  }

  def getLanguageName(): String = {
    g.console.log("getLanguageName")
    return "Scala"
  }

  def getServerName(): String = {
    g.console.log("getServerName")
    return "Scala"
  }

  def startServerProcess(projectPath: String): js.Any = {
    g.console.log("startServerProcess")
    // TODO: should return child_process
    return "Scala"
  }
}

object Exports {
  @JSExportTopLevel("client")
  val client = new ScalaLanguageClient()

  @JSExportTopLevel("activate")
  def activate(): Unit = client.activate()

  @JSExportTopLevel("deactivate")
  def deactivate(): Unit = client.deactivate()
}
