package laughedelic.atom.ide.scala.facade.atom_ide.busy_signal

import scala.scalajs.js, js.annotation._

// https://github.com/facebook-atom/atom-ide-ui/blob/master/modules/atom-ide-ui/pkg/atom-ide-busy-signal/lib/types.js
@js.native
@JSImport("atom-ide-busy-signal", "BusyMessage")
class BusySignalService extends js.Object {

  // Activates the busy signal with the given title and returns the promise
  // from the provided callback.
  // The busy signal automatically deactivates when the returned promise
  // either resolves or rejects.
  def reportBusyWhile[T](
    title: String,
    f: () => js.Promise[T],
    // options?: BusySignalOptions,
    options: js.Any = js.native
  ): js.Promise[T] = js.native

  // Activates the busy signal. Set the title in the returned BusySignal
  // object (you can update the title multiple times) and dispose it when done.
  def reportBusy(
    title: String,
    // options?: BusySignalOptions
    options: js.Any = js.native
  ): BusyMessage = js.native

}
