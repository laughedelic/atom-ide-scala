lazy val apmPackage = taskKey[File]("Generates package.json for apm")

apmPackage := {
  import play.api.libs.json._

  val log = streams.value.log
  val packageJson = baseDirectory.value / "package.json"

  val author = developers.value.head
  val repository = scmInfo.value.get.browseUrl.toString
  // val mainJs = (artifactPath in (Compile, fullOptJS)).value
  val mainJs = fullOptJS.in(Compile).value.data
  val licenseName = licenses.value.head._1

  val json = Json.obj(
    "name" -> name.value.stripPrefix("atom-"),
    "main" -> s"./${mainJs.relativeTo(baseDirectory.value).get}",
    "version" -> "0.4.0", //version.value,
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
      "atom-languageclient" -> "0.7.0",
      "find-java-home" -> "0.2.0"
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
      "signature-help" -> Json.obj(
        "versions" -> Json.obj("0.1.0" -> "consumeSignatureHelp")
      ),
    ),
    "providedServices" -> Json.obj(
      "definitions" -> Json.obj(
        "versions" -> Json.obj("0.1.0" -> "provideDefinitions")
      ),
      "hyperclick" -> Json.obj(
        "versions" -> Json.obj("0.1.0" -> "provideHyperclick")
      ),
      "find-references" -> Json.obj(
        "versions" -> Json.obj("0.1.0" -> "provideFindReferences")
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
    ),
    "configSchema" -> Json.obj(
      "server" -> Json.obj(
        "type" -> "string",
        "title" -> "Language server",
        "default" -> "scalameta",
        "enum" -> Json.arr(
          Json.obj(
            "value" -> "scalameta",
            "description" -> "Scalameta"
          ),
          Json.obj(
            "value" -> "ensime",
            "description" -> "ENSIME"
          )
        )
      )
    )
  )

  IO.write(packageJson, Json.prettyPrint(json))
  packageJson
}

publish := {
  import sys.process._
  val log = streams.value.log

  dynverAssertVersion.value
  if (!isVersionStable.value) sys.error("There are uncommited changes")

  val tagName = s"v${version.value}"
  val mainJs = fullOptJS.in(Compile).value.data
  val packageJson = apmPackage.value
  val coursierJar = {
    import sys.process._
    val file = baseDirectory.value / "coursier"
    if (!file.exists) {
      log.info("Downloading coursier...")
      new java.net.URL("https://git.io/vgvpD") #> file !!
    }
    file
  }

  def git(args: String*) = ("git" +: args).!(log)

  // Prepare commit on detached HEAD
  git("checkout", "--quiet", "--detach", "HEAD")
  git("add", "--force", mainJs.getPath, packageJson.getPath, coursierJar.getPath)
  git("status", "-s")
  git("commit", "--quiet", "-m", s"Prepared ${tagName} release")
  git("log", "--oneline", "-1")

  // Tag and push to Github
  git("tag", tagName)
  git("push", "--porcelain", "origin", tagName)

  // Publish to Atom.io
  val exitCode = Seq("apm", "publish", "--tag", tagName).!(log)
  if (exitCode == 0) {
    Seq("apm", "view", "ide-scala").!(log)
    git("checkout", "--quiet", "-")
  } else {
    // Revert the tag
    git("checkout", "--quiet", "-")
    git("push", "-d", "--porcelain", "origin", tagName)
    git("tag",  "-d", tagName)

    sys.error("apm publish failed")
  }
}

def nextVersion(current: String): complete.Parser[String] = {
  import complete.DefaultParsers._

  val semver = """v?([0-9]+)\.([0-9]+)\.([0-9]+)([-+].*)?""".r
  val bumper = oneOf(Seq("major", "minor", "patch").map(literal))

  Space ~> bumper.flatMap { bump =>
    current match {
      case semver(maj, min, bug, _) => bump match {
        case "major" => success( s"${maj.toInt + 1}.${min}.${bug}" )
        case "minor" => success( s"${maj}.${min.toInt + 1}.${bug}" )
        case "patch" => success( s"${maj}.${min}.${bug.toInt + 1}" )
      }
      case _ => failure("Current version is not semantic")
    }
  }
}

commands += Command("release")(_ => nextVersion(version.value)) { (state0, newVersion) =>
  import scala.io.AnsiColor._
  state0.log.info(s"Releasing ${BOLD}v${newVersion}${RESET}...")

  val state1 = Project.extract(state0).append(Seq(version := newVersion), state0)
  val state2 = Project.extract(state1).runTask(publish in Compile, state1)._1
  state2
}
