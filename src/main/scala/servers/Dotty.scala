package laughedelic.atom.ide.scala

object Dotty extends ScalaLanguageServer {
  val name: String = "Dotty"
  val description: String = "Dotty language server (experimental)"
  val defaultVersion: String = "0.7.0-RC1"

  def javaArgs(projectPath: String): Seq[String] = Seq()

  def coursierArgs(version: String): Seq[String] = {
    // FIXME: artifact should be read from the file, but it requires passing here projectPath
    // For now artifact reference will be hardcoded
    // import io.scalajs.nodejs.fs.Fs
    // val artifact = Fs.readFileSync(".dotty-ide-artifact").toString("utf-8").trim
    Seq(
      s"ch.epfl.lamp:dotty-language-server_0.7:${version}",
      "--main", "dotty.tools.languageserver.Main",
      "--", "-stdio"
    )
  }

  def watchFilter(filePath: String): Boolean = false
}
