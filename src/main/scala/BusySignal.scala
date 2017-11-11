package laughedelic.atom.ide.scala

import facade.atom_ide.busy_signal._

case class BusySignal(service: BusySignalService, name: String) {
  private var tooltip: Option[BusyMessage] = None

  private def formatMessage(text: String) = s"${name}: ${text}"

  def update(
    text: String = "",
    init: Boolean = false,
    reveal: Boolean = false
  ): Unit = tooltip match {
    case Some(message) =>
      if (text.isEmpty) {
        message.dispose()
        tooltip = None
      } else {
        message.setTitle( formatMessage(text) )
      }
    case None => if (init) {
      tooltip = Some(
        service.reportBusy( formatMessage(text) )
      )
    }
  }

  def clear(): Unit = update()
}
