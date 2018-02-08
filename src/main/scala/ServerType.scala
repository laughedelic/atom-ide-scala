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

  case object Scalameta extends ServerType {
    val name: String = "Scalameta"
    val description: String = "Scalameta"
    val defaultVersion: String = "5ddb92a9"

    def javaArgs(projectPath: String): Seq[String] = Seq(
      // "-XX:+UseG1GC",
      // "-XX:+UseStringDeduplication"
    )

    def coursierArgs(javaHome: String, version: String = defaultVersion): Seq[String] = Seq(
      "--repository", "bintray:dhpcs/maven",
      "--repository", "bintray:scalameta/maven",
      s"org.scalameta:metaserver_2.12:${version}",
      "--main", "scala.meta.languageserver.Main"
    )

    def watchFilter(filePath: String): Boolean = {
      filePath.endsWith(".semanticdb") ||
      filePath.endsWith(".compilerconfig")
    }
  }

  case object Ensime extends ServerType {
    val name: String = "ensime"
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

  def fromConfig: ServerType = {
    Config.serverType.get match {
      case Scalameta.name => Scalameta
      case Ensime.name => Ensime
    }
  }

  val values = Seq(Scalameta, Ensime)
}
