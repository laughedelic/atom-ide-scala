package laughedelic.atom.ide.scala

import laughedelic.atom.config._
import scala.util.Try

object Dotty extends ScalaLanguageServer {
  val name: String = "dotty"
  val description: String = "Dotty"
  val defaultVersion: String = "0.7.0-RC1"

  private val artifactFile = ".dotty-ide-artifact"

  def trigger(projectPath: String): Boolean = {
    (projectPath / artifactFile).isFile
    // or .dotty-ide.json?
  }

  def watchFilter(filePath: String): Boolean = false

  def coursierArgs(projectPath: String): Seq[String] = {
    val artifactRef = Try {
      (projectPath / artifactFile).readSync().trim
    } getOrElse {
      s"ch.epfl.lamp:dotty-language-server_0.7:${Config.dotty.version.get}"
    }
    Seq(
      artifactRef,
      "--main", "dotty.tools.languageserver.Main",
      "--", "-stdio"
    )
  }

  val commands = Map()
}

object DottyConfig extends ConfigSchema {

  val version = new Setting[String](
    title = "Dotty version",
    description = "This version will be used only if `.dotty-ide-artifact` is missing",
    default = Dotty.defaultVersion,
  )
}
