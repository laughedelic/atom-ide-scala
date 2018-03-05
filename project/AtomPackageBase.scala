package laughedelic.sbt

import sbt._, Keys._, complete._, DefaultParsers._
import scala.io.AnsiColor._
import play.api.libs.json._
import org.scalajs.sbtplugin.ScalaJSPlugin, ScalaJSPlugin.autoImport._
import org.scalajs.core.tools.linker.standard._

case object AtomPackageBase extends AutoPlugin {

  override def requires = ScalaJSPlugin
  override def trigger = noTrigger

  override def projectSettings = Seq(
    scalaJSLinkerConfig ~= { conf =>
      conf
        .withModuleKind(ModuleKind.CommonJSModule)
        .withOutputMode(OutputMode.ECMAScript2015)
        .withSourceMap(false)
    },

    packageBin in Compile := fullOptJS.in(Compile).value.data,
    // Main task that packages this Atom plugin
    sbt.Keys.`package` in Compile := (packageBin in Compile).value,
  )

}
