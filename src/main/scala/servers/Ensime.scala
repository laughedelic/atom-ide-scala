package laughedelic.atom.ide.scala

import laughedelic.atom.config._

object Ensime extends ScalaLanguageServer {
  val name: String = "ensime"
  val description: String = "Ensime (broken!)"
  val defaultVersion: String = "3.0.0-SNAPSHOT"

  def trigger(projectPath: String): Boolean = {
    (projectPath / ".ensime").isFile
  }

  def watchFilter(filePath: String): Boolean = {
    // TODO: should be more precise:
    filePath.contains(".ensime")
  }

  override def javaExtraArgs(projectPath: String): Seq[String] = {
    Seq(
      "-Xmx4G",
      // FIXME: parse .ensime config to setup classpath properly
      // "-classpath", classpath,
      s"-Dlsp.workspace=${projectPath}",
      "-Dlsp.logLevel=DEBUG",
    ) ++
    super.javaExtraArgs(projectPath)
  }

  def coursierArgs(projectPath: String): Seq[String] = Seq(
    "--repository", "bintray:dhpcs/maven",
    "--repository", "sonatype:snapshots",
    s"org.ensime:server_2.12:${Config.ensime.version.get}",
    "--main", "org.ensime.server.Server",
    "--", "--lsp"
  )

  val commands = Map()
}

object EnsimeConfig extends ConfigSchema {

  val version = new Setting[String](
    title = "Ensime version",
    default = Ensime.defaultVersion,
  )
}
