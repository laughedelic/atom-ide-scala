package laughedelic.atom.ide.scala

import scala.scalajs.js
import facade.atom_ide.busy_signal._

case class BusySignal(service: BusySignalService, name: String) {
  private var tooltip: Option[BusyMessage] = None

  private def formatMessage(text: String) = s"${name}: ${text}"

  def update(
    text: String = "",
    init: Boolean = false,
    reveal: Boolean = false
  ): Unit = tooltip match {
    case Some(tip) =>
      if (text.nonEmpty) tip.setTitle(formatMessage(text))
      else {
        tip.dispose()
        tooltip = None
      }
    case None => if (init) {
      tooltip = Some(
        service.reportBusy(
          formatMessage(text),
          js.Dynamic.literal("revealTooltip" -> reveal)
        )
      )
    }
  }

  def clear(): Unit = update()
}
