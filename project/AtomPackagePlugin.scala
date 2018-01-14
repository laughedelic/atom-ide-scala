package laughedelic.sbt

import sbt._, Keys._, complete._, DefaultParsers._
import scala.io.AnsiColor._
import play.api.libs.json._

case object PublishMore extends AutoPlugin {

  override def trigger = allRequirements
  // ScalaJSPlugin

  case object autoImport {

    lazy val apmMain = settingKey[File]("Path to the package entry point")
    lazy val apmKeywords = settingKey[Seq[String]]("keywords value in the package.json")
    lazy val apmEngines = settingKey[Map[String, String]]("engines value in the package.json")
    lazy val apmDependencies = settingKey[Map[String, String]]("dependencies value in the package.json")
    lazy val apmConsumedServices = settingKey[Map[String, Map[String, String]]]("consumedServices value in the package.json")
    lazy val apmProvidedServices = settingKey[Map[String, Map[String, String]]]("providedServices value in the package.json")
    lazy val apmConfigSchema = settingKey[JsObject]("configSchema value in the package.json")

    lazy val apmJson = settingKey[JsObject]("")
    lazy val apmPackageJson = settingKey[File]("Path to the generated package.json file")

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
    artifactPath in (Compile, fullOptJS) := apmMain,
    artifactPath in (Compile, fastOptJS) := apmMain,

    packageBin in Compile := fullOptJS.in(Compile).value.data,
    // Main task that packages this Atom plugin
    sbt.Keys.`package` in Compile := (packageBin in Compile).value,

    cleanFiles ++= Seq(
      apmMain
    ),

    apmKeywords := Seq(),
    apmDependencies := Map(),
    apmConsumedServices := Map(),
    apmProvidedServices := Map(),
    apmConfigSchema := Json.obj(),

    apmJsonFile := baseDirectory.value / "package.json",
    apmJson := {
      val author = developers.value.head
      val repository = scmInfo.value.get.browseUrl.toString
      val mainJs = (artifactPath in (Compile, fullOptJS)).value
      val licenseName = licenses.value.head._1

      Json.obj(
        "name" -> name.value.stripPrefix("atom-"),
        "main" -> s"./${mainJs.relativeTo(baseDirectory.value).get}",
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
        "keywords" -> Json.arr(
          apmKeywords.value.distinct: _*
        ),
        "engines" -> Json.obj(
          apmEngines.value.toSeq: _*
        ),
        "dependencies" -> Json.obj(
          apmDependencies.value.toSeq: _*
        ),
        "consumedServices" -> Json.obj(
          apmConsumedServices.value.toSeq: _*
        ),
        "providedServices" -> Json.obj(
          apmProvidedServices.value.toSeq: _*
        ),
        "configSchema" -> apmConfigSchema.value
      )
    },

    packageJson := {
      val file = apmJsonFile.value
      sLog.value.info(s"Writing ${file} ...")
      IO.write(file, Json.prettyPrint(apmJson.value))
      file
    }

  )

}
