package laughedelic.atom.ide

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

    def readSync(): String = Fs.readFileSync(path).toString("utf-8")
  }
}
