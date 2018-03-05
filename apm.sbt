import play.api.libs.json._

lazy val getCoursier = taskKey[File]("Downloads Coursier if needed")

getCoursier := {
  import sys.process._
  val log = streams.value.log
  val file = baseDirectory.value / "coursier"
  if (!file.exists) {
    log.info("Downloading coursier...")
    val exitCode = (new java.net.URL("https://git.io/vgvpD") #> file).!(log)
    if (exitCode != 0) sys.error("Couldn't download Coursier")
  }
  file
}

// TODO: typed config definition in the code
apmConfigSchema := Json.obj(
  "serverType" -> Json.obj(
    "order" -> 1,
    "type" -> "string",
    "title" -> "Language Server Type",
    "description" -> "Don't change this option unless you know what you're doing",
    "default" -> "scalameta",
    "enum" -> Json.arr(
      Json.obj(
        "value" -> "scalameta",
        "description" -> "Scalameta"
      ),
      Json.obj(
        "value" -> "ensime",
        "description" -> "ENSIME (experimental)"
      )
    )
  ),
  "serverVersion" -> Json.obj(
    "order" -> 2,
    "type" -> "string",
    "title" -> "Language Server Version",
    "default" -> "5ddb92a9"
  ),
  "jvm" -> Json.obj(
    "order" -> 3,
    "type" -> "object",
    "title" -> "Java-related settings",
    "properties" -> Json.obj(
      "javaHome" -> Json.obj(
        "type" -> "string",
        "title" -> "Java Home",
        "description" -> "Plugin will try to guess your Java Home path, but if you have a very specific setup you can use this option to set it explicitly",
        "default" -> ""
      ),
      "javaOpts" -> Json.obj(
        "type" -> "array",
        "title" -> "Extra JVM options",
        "default" -> Json.arr(),
        "items" -> Json.obj(
          "type" -> "string"
        )
      )
    )
  )
)

apmKeywords := Seq(
  "scala",
  "scalameta",
  "ide",
  "atom-ide",
  "lsp",
  "language-server",
  "language-server-protocol"
)

apmEngines := Map(
  "atom" -> ">=1.21.0 <2.0.0"
)

apmDependencies := Map(
  "atom-languageclient" -> "0.7.3",
  "atom-package-deps" -> "4.6.1",
  "find-java-home" -> "0.2.0"
)

apmConsumedServices := Map(
  "linter-indie"          -> Map("2.0.0" -> "consumeLinterV2"),
  "datatip"               -> Map("0.1.0" -> "consumeDatatip"),
  "atom-ide-busy-signal"  -> Map("0.1.0" -> "consumeBusySignal"),
  "signature-help"        -> Map("0.1.0" -> "consumeSignatureHelp")
)

apmProvidedServices := Map(
  "definitions"           -> Map("0.1.0" -> "provideDefinitions"),
  "code-highlight"        -> Map("0.1.0" -> "provideCodeHighlight"),
  "code-actions"          -> Map("0.1.0" -> "provideCodeActions"),
  "hyperclick"            -> Map("0.1.0" -> "provideHyperclick"),
  "find-references"       -> Map("0.1.0" -> "provideFindReferences"),
  "autocomplete.provider" -> Map("2.0.0" -> "provideAutocomplete"),
  "code-format.range"     -> Map("0.1.0" -> "provideCodeFormat"),
  "outline-view"          -> Map("0.1.0" -> "provideOutlines")
)

apmJsonExtra := Json.obj(
  "enhancedScopes" -> Json.arr(
    "source.scala"
  ),
  "package-deps" -> Json.arr(
    "language-scala",
    "atom-ide-ui"
  )
)

apmExtraFiles ++= Seq(
  getCoursier.value
)

// Main task that packages this Atom plugin
sbt.Keys.`package` in Compile :=
  packageBin.in(Compile)
    .dependsOn(getCoursier)
    .value

ghreleaseAssets := Seq(
  (artifactPath in (Compile, fullOptJS)).value,
  packageJson.value
)
