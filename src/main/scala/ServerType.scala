package laughedelic.atom.ide.scala

import scala.scalajs.js, js.annotation._, js.Dynamic.global

sealed trait ServerType {

  val name: String

  val coursierArgs: Seq[String]

  def watchFilter(filePath: String): Boolean
}

case object ServerType {

  case object Scalameta extends ServerType {
    val name: String = "Scalameta"

    val coursierArgs: Seq[String] = Seq(
      "--repository", "bintray:dhpcs/maven",
      "--repository", "sonatype:releases",
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

    val coursierArgs: Seq[String] = Seq(
      "--repository", "bintray:dhpcs/maven",
      "--repository", "sonatype:releases",
      "com.github.dragos:ensime-lsp_2.12:0.2.1",
      "--main", "org.github.dragos.vscode.Main"
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
