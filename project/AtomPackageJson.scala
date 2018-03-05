package laughedelic.sbt

import sbt._, Keys._, complete._, DefaultParsers._
import scala.io.AnsiColor._
import play.api.libs.json._
import org.scalajs.sbtplugin.ScalaJSPlugin, ScalaJSPlugin.autoImport._
import org.scalajs.core.tools.linker.standard._

case object AtomPackageJson extends AutoPlugin {

  override def requires = AtomPackageBase
  override def trigger = noTrigger

  case object autoImport {

    lazy val apmMain = settingKey[File]("Path to the package entry point")
    lazy val apmKeywords = settingKey[Seq[String]]("keywords value in the package.json")
    lazy val apmEngines = settingKey[Map[String, String]]("engines value in the package.json")
    lazy val apmDependencies = settingKey[Map[String, String]]("dependencies value in the package.json")
    lazy val apmConsumedServices = settingKey[Map[String, Map[String, String]]]("consumedServices value in the package.json")
    lazy val apmProvidedServices = settingKey[Map[String, Map[String, String]]]("providedServices value in the package.json")

    lazy val apmJson = settingKey[JsObject]("JSON object with the values derived from the sbt settings")
    lazy val apmJsonExtra = settingKey[JsObject]("JSON object which will be appended to apmJson in the generated package.json")
    lazy val apmJsonFile = settingKey[File]("Path to the generated package.json file")

    lazy val packageJson = settingKey[File]("Generates package.json for apm")
  }
  import autoImport._

  override def projectSettings = Seq(
    scalaJSLinkerConfig ~= { conf =>
      conf
        .withModuleKind(ModuleKind.CommonJSModule)
        .withOutputMode(OutputMode.ECMAScript2015)
        .withSourceMap(false)
    },

    // Following atom packages convention: lib/main.js is the plugin's entry point
    apmMain := baseDirectory.value / "lib" / "main.js",
    artifactPath in (Compile, fullOptJS) := apmMain.value,
    artifactPath in (Compile, fastOptJS) := apmMain.value,

    packageBin in Compile := fullOptJS.in(Compile).value.data,
    // Main task that packages this Atom plugin
    sbt.Keys.`package` in Compile := (packageBin in Compile).value,

    cleanFiles ++= Seq(
      apmMain.value
    ),

    apmKeywords := Seq(),
    apmDependencies := Map(),
    apmConsumedServices := Map(),
    apmProvidedServices := Map(),

    apmJsonFile := baseDirectory.value / "package.json",
    apmJsonExtra := Json.obj(),
    apmJson := {
      val mainJs = baseDirectory.value.toPath.relativize(apmMain.value.toPath)

      val author = developers.value.headOption.getOrElse {
        sys.error("You need to set the `developers` key")
      }

      val repository = scmInfo.value.getOrElse {
        sys.error("You need to set the `scmInfo` key")
      }.browseUrl.toString

      val licenseName = licenses.value.headOption.getOrElse {
        sys.error("You need to set the `licenses` key")
      }._1

      Json.obj(
        "name" -> name.value.stripPrefix("atom-"),
        "main" -> s"./${mainJs}",
        "version" -> version.value,
        "description" -> description.value,
        "author" -> Json.obj(
          "name"  -> author.name,
          "email" -> author.email,
          "url"   -> author.url.toString
        ),
        "repository" -> repository,
        "bugs"       -> s"${repository}/issues",
        "license" -> licenseName,
        "keywords" -> apmKeywords.value.distinct,
        "engines" -> apmEngines.value,
        "dependencies" -> apmDependencies.value,
        "consumedServices" -> apmConsumedServices.value,
        "providedServices" -> apmProvidedServices.value
      )
    },

    packageJson := {
      val relativePath = baseDirectory.value.toPath.relativize(apmJsonFile.value.toPath)
      sLog.value.info(s"Writing ${relativePath} ...")
      val json = apmJson.value ++ apmJsonExtra.value
      IO.write(apmJsonFile.value, Json.prettyPrint(json))
      apmJsonFile.value
    }

  )

}
