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

  // coursier is not used for Ensime, because we get all information from the
  // .ensime file and use it to launch java process directly
  def coursierArgs(projectPath: String): Seq[String] = Seq()

  override def launch(projectPath: String): ChildProcess = {
    val dotEnsime = (projectPath / ensimeFile).readSync()
      .flatMap(DotEnsime.parse) getOrElse fail(
        "Couldn't parse `.ensime` file",
        s"Follow [documentation](http://ensime.github.io/build_tools) for your build tool to generate correct `.ensime` project file",
      )
    val javaBin: String = dotEnsime.javaHome / "bin" / "java"
    val javaArgs: Seq[String] =
      dotEnsime.javaFlags ++ Seq(
        "-classpath", dotEnsime.classpath.mkString(Path.delimiter),
        s"-Densime.config=${projectPath / ensimeFile}", // saw it somewhere, not sure it's needed
        s"-Dlsp.workspace=${projectPath}",
        // s"-Dlsp.logLevel=${Config.ensime.logLevel.get}", // ensime config is removed for now
        "org.ensime.server.Server", "--lsp"
      )
    println((javaBin +: javaArgs).mkString("\n"))

    ChildProcess.spawn(
      javaBin, javaArgs.toJSArray,
      new SpawnOptions(cwd = projectPath)
    )
  }

  val commands = Map()

  private def fail(message: String, desc: String = "") = {
    Atom.notifications.addError(
      message,
      new NotificationOptions(
        description = desc,
        dismissable = true,
      )
    )
    throw new RuntimeException(message)
  }
}

object EnsimeConfig extends ConfigSchema {

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

@js.native @JSImport("s-expression", JSImport.Namespace)
object sExpression extends js.Object {
  def apply(text: String): js.Any = js.native
}

case class DotEnsime(
  val scalaCompilerJars: Seq[String],
  val ensimeServerJars: Seq[String],
  val javaFlags: Seq[String],
  val javaHome: String,
) {
  lazy val classpath: Seq[String] = scalaCompilerJars ++ ensimeServerJars
}

object DotEnsime {

  def parse(text: String): Try[DotEnsime] = {
    // It's parsed into a list of keys and values: (k1, v1, k2, v2, k3, v3, ...)
    val parsed: Try[Seq[js.Any]] = Try {
      sExpression(text).asInstanceOf[js.Array[js.Any]].toSeq
    }
    val parsedMap: Try[Map[String, js.Any]] = parsed.map { seq =>
      seq.sliding(2, 2)
        .collect { case Seq(x, y) =>
          x.toString -> y
        }.toMap
    }
    def extract[T](key: String): Try[T] = parsedMap.map {
      _.get(key).get.asInstanceOf[T]
    }
    for {
      scj <- extract[js.Array[String]](":scala-compiler-jars")
      esj <- extract[js.Array[String]](":ensime-server-jars")
      jf <- extract[js.Array[String]](":java-flags")
      jh <- extract[String](":java-home")
    } yield DotEnsime(
      scalaCompilerJars = scj,
      ensimeServerJars = esj,
      javaFlags = jf,
      // NOTE: this is a bit tricky, because it's parsed as a string object and
      // we convert it to a string primitive (while for Scala it's all String)
      javaHome = jh.asInstanceOf[js.Object].valueOf().toString(),
    )
  }
}
