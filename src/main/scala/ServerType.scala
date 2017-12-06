package laughedelic.atom.ide.scala

import scala.scalajs.js, js.annotation._, js.Dynamic.global

sealed trait ServerType {

  val name: String

  def javaArgs(projectPath: String): Seq[String]
  val coursierArgs: Seq[String]

  def watchFilter(filePath: String): Boolean
}

case object ServerType {

  case object Scalameta extends ServerType {
    val name: String = "Scalameta"

    def javaArgs(projectPath: String): Seq[String] = Seq(
      "-XX:+UseG1GC",
      "-XX:+UseStringDeduplication",
      s"-Dvscode.workspace=${projectPath}"
    )

    val coursierArgs: Seq[String] = Seq(
      "--repository", "bintray:dhpcs/maven",
      "--repository", "bintray:scalameta/maven",
      "org.scalameta:metaserver_2.12:0.1-SNAPSHOT",
      "--main", "scala.meta.languageserver.Main"
    )

    def watchFilter(filePath: String): Boolean = {
      filePath.endsWith(".semanticdb") ||
      filePath.endsWith(".compilerconfig")
    }
  }

  case object Ensime extends ServerType {
    val name: String = "ENSIME"

    def javaArgs(projectPath: String): Seq[String] = Seq(
      "-Xmx4G", // heap size
      // FIXME: how to setup classpath properly without parsing .ensime config?
      // "-classpath", classpath,
      s"-Dlsp.workspace=${projectPath}",
      // TODO: add log level to the plugin settings
      s"-Dlsp.logLevel=DEBUG",
    )

    val coursierArgs: Seq[String] = Seq(
      "--repository", "bintray:dhpcs/maven",
      "--repository", "sonatype:snapshots",
      "org.ensime:server_2.12:3.0.0-SNAPSHOT",
      "--main", "org.ensime.server.Server",
      "--", "--lsp"
    )

    def watchFilter(filePath: String): Boolean = {
      // TODO: should be more precise:
      filePath.contains(".ensime")
    }
  }

  def fromConfig: ServerType = {
    global.atom.config.get("ide-scala.server").toString match {
      case "scalameta" => Scalameta
      case "ensime" => Ensime
    }
  }
}
