package laughedelic.atom.ide.scala

import io.scalajs.nodejs.path.Path
import scala.scalajs.js, js.annotation._, js.Dynamic.global
import laughedelic.atom.Atom

sealed trait ServerType {

  val name: String
  val description: String
  val defaultVersion: String

  def javaArgs(projectPath: String): Seq[String]
  def coursierArgs(javaHome: String, version: String): Seq[String]

  def watchFilter(filePath: String): Boolean
}

case object ServerType {

  case object Metals extends ServerType {
    val name: String = "Metals"
    val description: String = "Metals (Scalameta language server)"
    val defaultVersion: String = "e1b3a1fa"

    def javaArgs(projectPath: String): Seq[String] = Seq(
      "-XX:+UseG1GC",
      "-XX:+UseStringDeduplication",
    )

    def coursierArgs(javaHome: String, version: String = defaultVersion): Seq[String] = Seq(
      "--repository", "bintray:scalameta/maven",
      s"org.scalameta:metals_2.12:${version}",
      "--main", "scala.meta.metals.Main"
    )

    def watchFilter(filePath: String): Boolean = {
      filePath.endsWith(".semanticdb") ||
      filePath.endsWith(".properties") ||
      filePath.endsWith("active.json")
    }
  }

  case object Ensime extends ServerType {
    val name: String = "Ensime"
    val description: String = "ENSIME (experimental)"
    val defaultVersion: String = "3.0.0-SNAPSHOT"

    def javaArgs(projectPath: String): Seq[String] = Seq(
      "-Xmx4G", // heap size
      // FIXME: how to setup classpath properly without parsing .ensime config?
      // "-classpath", classpath,
      s"-Dlsp.workspace=${projectPath}",
      // TODO: add log level to the plugin settings
      s"-Dlsp.logLevel=DEBUG",
    )

    def coursierArgs(javaHome: String, version: String = defaultVersion): Seq[String] = {
      val toolsJar = Path.join(javaHome, "lib", "tools.jar")
      Seq(
        "--extra-jars", toolsJar,
        "--repository", "bintray:dhpcs/maven",
        "--repository", "sonatype:snapshots",
        s"org.ensime:server_2.12:${version}",
        "--main", "org.ensime.server.Server",
        "--", "--lsp"
      )
    }

    def watchFilter(filePath: String): Boolean = {
      // TODO: should be more precise:
      filePath.contains(".ensime")
    }
  }

  def fromName(name: String): Option[ServerType] =
    name match {
      case "scalameta" => Some(Metals)
      case Metals.name => Some(Metals)
      case Ensime.name => Some(Ensime)
      case _ => None
    }

  // NOTE: config won't contain an ivalid value, so no Option here
  def fromConfig: ServerType =
    fromName(Config.serverType.get).get

  val values = Seq(Metals, Ensime)
}
