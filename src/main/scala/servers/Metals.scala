package laughedelic.atom.ide.scala

import scala.scalajs.js
import laughedelic.atom.config._
import laughedelic.atom.languageclient.{ ActiveServer, ExecuteCommandParams }

object Metals extends ScalaLanguageServer { server =>
  val name: String = "metals"
  val description: String = "Metals"
  val defaultVersion: String = "0.2.1"

  def trigger(projectPath: String): Boolean = {
    (projectPath / ".metals").isDirectory
  }

  def watchFilter(filePath: String): Boolean = false

  override def javaExtraArgs(projectPath: String): Seq[String] =
    Config.metals.javaArgs.get.toSeq ++ Seq(
      "-Dmetals.file-watcher=custom",
      "-Dmetals.extensions=true",
      "-Dmetals.icons=octicons",
    )

  def coursierArgs(projectPath: String): Seq[String] = Seq(
    s"org.scalameta:metals_2.12:${Config.metals.version.get}",
    "-r", "sonatype:snapshots", "-r", "bintray:scalacenter/releases",
    "--main", "scala.meta.metals.Main"
  )

  val commands = Seq(
    "build.import",
    "build.connect",
    "workspace.sources.scan",
  ).map { cmd =>
    cmd -> { activeServer: ActiveServer => _: js.Any =>
      activeServer.connection.executeCommand(
        new ExecuteCommandParams(command = cmd)
      )
    }
  }.toMap
}

object MetalsConfig extends ConfigSchema {

  // These are custom settings for the Metals launcher
  val version = new Setting[String](
    title = "Metals version",
    description = "Set it to `SNAPSHOT` if you're working on Metals and publish it locally",
    default = Metals.defaultVersion,
  )

  val javaArgs = new Setting[js.Array[String]](
    title = "Extra JVM options",
    default = js.Array(
      "-XX:+UseG1GC",
      "-XX:+UseStringDeduplication",
      "-Xss4m",
      "-Xms1G",
      "-Xmx4G",
    )
  )

}
