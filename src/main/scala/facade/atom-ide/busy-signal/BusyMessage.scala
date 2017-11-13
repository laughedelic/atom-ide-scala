package laughedelic.atom.ide.scala.facade.atom_ide.busy_signal

import scala.scalajs.js, js.annotation._

// https://github.com/facebook-atom/atom-ide-ui/blob/master/modules/atom-ide-ui/pkg/atom-ide-busy-signal/lib/types.js
@js.native
@JSImport("atom-ide-busy-signal", "BusyMessage")
class BusyMessage extends js.Object {

  // You can set/update the title.
  def setTitle(title: String): Unit = js.native

  // Dispose of the signal when done to make it go away.
  def dispose(): Unit = js.native
}
