package laughedelic.atom.ide.scala

import scala.scalajs.js, js.JSConverters._
import io.scalajs.nodejs.child_process.{ ChildProcess, SpawnOptions }
import laughedelic.atom.languageclient.ActiveServer

trait ScalaLanguageServer {
  val name: String
  val description: String
  val defaultVersion: String

  def trigger(projectPath: String): Boolean
  def watchFilter(filePath: String): Boolean

  def coursierArgs(projectPath: String): Seq[String]

  def javaExtraArgs(projectPath: String): Seq[String] = Seq()

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

  val commands: Map[String, ActiveServer => js.Any => Any]

  def postInitialization(
    client: ScalaLanguageClient,
    activeServer: ActiveServer
  ): Unit = {}
}

object ScalaLanguageServer {

  val default = Metals

  def fromName(name: String): Option[ScalaLanguageServer] =
    name match {
      case Metals.name | "scalameta" => Some(Metals)
      case Ensime.name => Some(Ensime)
      case Dotty.name  => Some(Dotty)
      case _ => None
    }

  def fromConfig: ScalaLanguageServer =
    fromName(Config.defaultServer.get).getOrElse(default)

  def defaultNonEmpty: Boolean =
    fromName(Config.defaultServer.get).nonEmpty

  val values = List(Metals, Dotty)
}
