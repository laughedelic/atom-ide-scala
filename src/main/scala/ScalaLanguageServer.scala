package laughedelic.atom.ide.scala

import scala.scalajs.js, js.JSConverters._
import io.scalajs.nodejs.child_process.{ ChildProcess, SpawnOptions }

trait ScalaLanguageServer {
  val name: String
  val description: String
  val defaultVersion: String

  def version: String = Config.serverVersion.get

  def trigger(projectPath: String): Boolean
  def watchFilter(filePath: String): Boolean

  def coursierArgs(projectPath: String): Seq[String]

  def javaExtraArgs(projectPath: String): Seq[String] =
    Config.java.extraArgs.get.toSeq

  def launch(projectPath: String): ChildProcess = {
    val javaArgs: Seq[String] = Seq(
      javaExtraArgs(projectPath),
      Seq("-jar", AtomPackage.coursier, "launch", "--quiet"),
      coursierArgs(projectPath),
    ).flatten
    // println(javaArgs.mkString("\n"))

    ChildProcess.spawn(
      "java", javaArgs.toJSArray,
      new SpawnOptions(cwd = projectPath)
    )
  }
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
