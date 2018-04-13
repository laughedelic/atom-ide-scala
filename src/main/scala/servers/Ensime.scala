package laughedelic.atom.ide.scala

object Ensime extends ScalaLanguageServer {
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

  def coursierArgs(version: String): Seq[String] = {
    Seq(
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
