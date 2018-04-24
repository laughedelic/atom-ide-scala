package laughedelic.atom.ide.scala

import scala.scalajs.js, js.annotation._, js.JSConverters._
import io.scalajs.nodejs.path.Path
import io.scalajs.nodejs.child_process.{ ChildProcess, SpawnOptions }
import scala.util.Try
import laughedelic.atom._
import laughedelic.atom.config._

object Ensime extends ScalaLanguageServer {
  val name: String = "ensime"
  val description: String = "Ensime (broken!)"
  val defaultVersion: String = "3.0.0-SNAPSHOT"

  private val ensimeFile: String = ".ensime"

  def trigger(projectPath: String): Boolean = {
    (projectPath / ensimeFile).isFile
  }

  def watchFilter(filePath: String): Boolean = {
    // TODO: should be more precise:
    filePath.contains(".ensime")
  }

  // override def javaExtraArgs(projectPath: String): Seq[String] = Seq()

  // coursier is not used for Ensime, because we get all information from the
  // .ensime file and use it to launch java process directly
  def coursierArgs(projectPath: String): Seq[String] = Seq()

  override def launch(projectPath: String): ChildProcess = {
    val dotEnsime: DotEnsime = Try {
      (projectPath / ensimeFile).readSync().trim
    }.toOption.flatMap { text =>
      sExpressions.parse(text)
    }.getOrElse {
      val message = "Couldn't parse `.ensime` file"
      Atom.notifications.addError(
        message,
        new NotificationOptions(
          description = s"Follow [documentation](http://ensime.github.io/build_tools) for your build tool to generate correct `.ensime` project file",
          detail = projectPath,
          dismissable = true,
          // icon = "",
        )
      )
      throw new RuntimeException(message)
    }
    val javaArgs: Seq[String] = Seq(
      dotEnsime.javaFlags,
      Seq(
        "-classpath", dotEnsime.classpath.mkString(Path.delimiter),
        s"-Dlsp.workspace=${projectPath}",
        s"-Dlsp.logLevel=${Config.ensime.logLevel.get}",
      ),
      // javaExtraArgs(projectPath),
      Seq("org.ensime.server.Server", "--lsp")
    ).flatten
    println(javaArgs.mkString("\n"))

    ChildProcess.spawn(
      "java", javaArgs.toJSArray,
      new SpawnOptions(cwd = projectPath)
    )
  }

  val commands = Map()
}

object EnsimeConfig extends ConfigSchema {

  val version = new Setting[String](
    title = "Ensime version",
    default = Ensime.defaultVersion,
  )

  val logLevel = new Setting[String](
    title = "Logging verbosity",
    default = "DEBUG",
    enum = js.Array(
      "ERROR",
      "INFO",
      "DEBUG",
    ),
  )
}

case class DotEnsime(
  val scalaCompilerJars: Seq[String],
  val ensimeServerJars: Seq[String],
  val javaFlags: Seq[String],
) {
  lazy val classpath: Seq[String] = scalaCompilerJars ++ ensimeServerJars
}

object sExpressions {

  @js.native @JSImport("s-expression", JSImport.Namespace)
  private object parseRaw extends js.Object {
    def apply(text: String): js.Any = js.native
  }

  def parse(text: String): Option[DotEnsime] = {
    val parsedMap = parseRaw(text)
      .asInstanceOf[js.Array[js.Any]].toSeq
      .sliding(2, 2)
      .collect { case Seq(x, y) => x -> y }
      .toMap
    for {
      scj <- parsedMap.get(":scala-compiler-jars")
      esj <- parsedMap.get(":ensime-server-jars")
      jfs <- parsedMap.get(":java-flags")
    } yield DotEnsime(
      scalaCompilerJars = scj.asInstanceOf[js.Array[String]].toSeq,
      ensimeServerJars = esj.asInstanceOf[js.Array[String]].toSeq,
      javaFlags = jfs.asInstanceOf[js.Array[String]].toSeq,
    )
  }
}
