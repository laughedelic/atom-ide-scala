package laughedelic.atom.ide

import io.scalajs.nodejs.path.Path
import io.scalajs.nodejs.fs.Fs

package object scala {

  implicit class PathExt(val path: String) extends AnyVal {

    def /(suffix: String): String = Path.join(path, suffix)

    def isFile: Boolean = Fs.statSync(path).isFile()
    def isDirectory: Boolean = Fs.statSync(path).isDirectory()

    def readSync(): String = Fs.readFileSync(path).toString("utf-8")
  }
}
