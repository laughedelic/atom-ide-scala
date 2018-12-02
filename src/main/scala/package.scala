package laughedelic.atom.ide

import _root_.scala.scalajs.js
import laughedelic.atom.Atom
import org.scalajs.dom.raw.Element
import io.scalajs.nodejs.path.Path
import io.scalajs.nodejs.fs.Fs
import util.Try

package object scala {

  implicit class PathExt(val path: String) extends AnyVal {

    def /(suffix: String): String = Path.join(path, suffix)

    def isFile: Boolean =
      Try(Fs.statSync(path).isFile()).getOrElse(false)
    def isDirectory: Boolean =
      Try(Fs.statSync(path).isDirectory()).getOrElse(false)

    def readSync(): Try[String] = Try {
      Fs.readFileSync(path).toString("utf-8")
    }
  }

  def dispatchAtomCommand(command: String): Unit = {
    val target = Atom.asInstanceOf[js.Dynamic].views.getView(Atom.workspace).asInstanceOf[Element]
    Atom.commands.dispatch(target, command)
  }
}
