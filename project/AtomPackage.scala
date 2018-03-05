package laughedelic.sbt

import sbt._, Keys._, complete._, DefaultParsers._
import scala.io.AnsiColor._
import play.api.libs.json._
import org.scalajs.sbtplugin.ScalaJSPlugin, ScalaJSPlugin.autoImport._
import org.scalajs.core.tools.linker.standard._

case object AtomPackage extends AutoPlugin {

  override def trigger = noTrigger
  override def requires =
    AtomPackageJson &&
    AtomPackageVersion &&
    AtomPackageRelease

}
