package laughedelic.atom.ide.scala

import scala.scalajs.js, js.annotation._, js.Dynamic.global
import facade.atom_languageclient._
import facade.atom_ide.busy_signal._

// NOTE: This is pure boilerplate. We need it because we can't simply say `module.exports = new ScalaLanguageClient();`
object Exports {

  @JSExportTopLevel("client")
  val client = new ScalaLanguageClient()

  @JSExportTopLevel("activate")
  def activate(): Unit = client.activate()
  @JSExportTopLevel("deactivate")
  def deactivate(): js.Promise[js.Any] = client.deactivate()

  // Provider services
  @JSExportTopLevel("provideOutlines")
  def provideOutlines(): js.Any = client.provideOutlines()
  @JSExportTopLevel("provideDefinitions")
  def provideDefinitions(): js.Any = client.provideDefinitions()
  @JSExportTopLevel("provideCodeFormat")
  def provideCodeFormat(): js.Any = client.provideCodeFormat()
  @JSExportTopLevel("provideAutocomplete")
  def provideAutocomplete(): js.Any = client.provideAutocomplete()

  // Consumer services
  @JSExportTopLevel("consumeDatatip")
  def consumeDatatip(service: js.Any): Unit = client.consumeDatatip(service)
  @JSExportTopLevel("consumeLinterV2")
  def consumeLinterV2(registerIndie: js.Any): Unit = client.consumeLinterV2(registerIndie)
  @JSExportTopLevel("consumeBusySignal")
  def consumeBusySignal(service: BusySignalService): Unit = client.consumeBusySignal(service)

}
