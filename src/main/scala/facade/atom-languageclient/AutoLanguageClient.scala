package laughedelic.atom.ide.scala.facade.atom_languageclient

import scala.scalajs.js, js.annotation._
import io.scalajs.nodejs.child_process.ChildProcess

@js.native
@JSImport("atom-languageclient", "AutoLanguageClient")
class AutoLanguageClient extends js.Object {
  // Methods to export for Atom
  def activate(): Unit = js.native
  def deactivate(): js.Promise[js.Any] = js.native

  // Providers
  def provideOutlines(): js.Any = js.native
  def provideDefinitions(): js.Any = js.native
  def provideCodeFormat(): js.Any = js.native
  def provideAutocomplete(): js.Any = js.native

  // Consumers
  def consumeDatatip(service: js.Any): Unit = js.native
  def consumeLinterV2(registerIndie: js.Any): Unit = js.native
  def consumeSignatureHelp(registry: js.Any): js.Any = js.native

  // Methods obligatory to override
  def getGrammarScopes(): js.Array[String] = js.native
  def getLanguageName(): String = js.native
  def getServerName(): String = js.native
  def startServerProcess(projectPath: String): ChildProcess = js.native

  // Rest
  val processStdErr: String = js.native
  def captureServerErrors(childProcess: ChildProcess): Unit = js.native
  def handleSpawnFailure(err: js.Any): Unit = js.native
  def filterChangeWatchedFiles(filePath: String): Boolean = js.native
  // TODO: better types
  def preInitialization(connection: js.Any): Unit = js.native
  def postInitialization(server: js.Any): Unit = js.native
}
