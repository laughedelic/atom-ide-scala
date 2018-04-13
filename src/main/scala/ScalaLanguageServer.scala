package laughedelic.atom.ide.scala

import io.scalajs.nodejs.path.Path
import scala.scalajs.js, js.annotation._, js.Dynamic.global
import laughedelic.atom.Atom
import laughedelic.atom.config._

trait ScalaLanguageServer {
  val name: String
  val description: String
  val defaultVersion: String

  def javaArgs(projectPath: String): Seq[String]
  def coursierArgs(version: String): Seq[String]
  def watchFilter(filePath: String): Boolean
}

case object ScalaLanguageServer {

  def fromName(name: String): Option[ScalaLanguageServer] =
    name match {
      case Metals.name | "scalameta" => Some(Metals)
      case Ensime.name => Some(Ensime)
      case Dotty.name  => Some(Dotty)
      case _ => None
    }

  // NOTE: config won't contain an ivalid value, so no Option here
  def fromConfig: ScalaLanguageServer =
    fromName(Config.serverType.get).get

  val values = Seq(Metals, Dotty)
}
