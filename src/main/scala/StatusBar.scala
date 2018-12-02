/** This is a facade for the official status bar plugin:
  * https://github.com/atom/status-bar
  */
package laughedelic.atom.ide.ui.statusbar

import scala.scalajs.js, js.|
import org.scalajs.dom.raw.Element

class StatusTileOptions(
  val item: Element | js.Object,
  val priority: js.UndefOr[Int] = js.undefined,
) extends js.Object

@js.native
trait StatusTile extends js.Object {

  /** Retrieve the Tile's item. */
  def getItem(): Element | js.Object

  /** Retrieve the priority that was assigned to the Tile when it was created. */
  def getPriority(): Int

  /** Remove the Tile from the status bar. */
  def destroy(): Unit
}

@js.native
trait StatusBarView extends js.Object {

  /** Add a tile to the left side of the status bar. Lower priority tiles are
    * placed further to the left.
    */
  def addLeftTile(options: StatusTileOptions): StatusTile

  /** Add a tile to the right side of the status bar. Lower priority tiles are
    * placed further to the right.
    */
  def addRightTile(options: StatusTileOptions): StatusTile

  /** Retrieve all of the tiles on the left side of the status bar. */
  def getLeftTiles(): js.Array[StatusTile]

  /** Retrieve all of the tiles on the right side of the status bar. */
  def getRightTiles(): js.Array[StatusTile]

  def destroy(): Unit = js.native
}
