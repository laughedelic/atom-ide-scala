lazy val apmPackage = inputKey[File]("Generates package.json for apm")

apmPackage := {
  import play.api.libs.json._

  val log = streams.value.log
  val packageJson = baseDirectory.value / "package.json"

  val author = developers.value.head
  val repository = scmInfo.value.get.browseUrl.toString
  val mainJs = (artifactPath in (Compile, fullOptJS)).value
  val licenseName = licenses.value.head._1

  val json = Json.obj(
    "name" -> name.value.stripPrefix("atom-"),
    "main" -> s"./${mainJs.relativeTo(baseDirectory.value).get}",
    "version" -> version.value,
    "description" -> description.value,
    "author" -> Json.obj(
      "name"  -> author.name,
      "email" -> author.email,
      "url"   -> author.url.toString
    ),
    "keywords" -> Json.arr(
      "scala",
      "scalameta",
      "ide",
      "atom-ide",
      "lsp",
      "language-server",
      "language-server-protocol"
    ),
    "repository" -> repository,
    "bugs"       -> s"${repository}/issues",
    "license" -> licenseName,
    "engines" -> Json.obj(
      "atom" -> ">=1.21.0 <2.0.0"
    ),
    "enhancedScopes" -> Json.arr(
      "source.scala"
    ),
    "dependencies" -> Json.obj(
      "atom-languageclient" -> "0.6.7"
    ),
    "consumedServices" -> Json.obj(
      "linter-indie" -> Json.obj(
        "versions" -> Json.obj("2.0.0" -> "consumeLinterV2")
      ),
      "datatip" -> Json.obj(
        "versions" -> Json.obj("0.1.0" -> "consumeDatatip")
      ),
      "atom-ide-busy-signal" -> Json.obj(
        "versions" -> Json.obj("0.1.0" -> "consumeBusySignal")
      ),
    ),
    "providedServices" -> Json.obj(
      "definitions" -> Json.obj(
        "versions" -> Json.obj("0.1.0" -> "provideDefinitions")
      ),
      "hyperclick" -> Json.obj(
        "versions" -> Json.obj("0.1.0" -> "provideHyperclick")
      ),
      "autocomplete.provider" -> Json.obj(
        "versions" -> Json.obj("2.0.0" -> "provideAutocomplete")
      ),
      "code-format.range" -> Json.obj(
        "versions" -> Json.obj("0.1.0" -> "provideCodeFormat")
      ),
      "outline-view" -> Json.obj(
        "versions" -> Json.obj("0.1.0" -> "provideOutlines")
      )
    )
  )

  // val original = Json.parse(IO.read(packageJson)).as[JsObject]
  // val diff = original.fieldSet diff json.fieldSet
  // log.error(diff.toString)

  IO.write(packageJson, Json.prettyPrint(json))
  packageJson
}
