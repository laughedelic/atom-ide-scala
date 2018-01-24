lazy val getCoursier = taskKey[File]("Downloads Coursier if needed")
lazy val packageJson = settingKey[File]("Generates package.json for apm")

// Following atom packages convention: lib/main.js is the plugin's entry point
artifactPath in (Compile, fullOptJS) := baseDirectory.value / "lib" / "main.js"
artifactPath in (Compile, fastOptJS) := (artifactPath in (Compile, fullOptJS)).value

packageBin in Compile := fullOptJS.in(Compile).value.data

cleanFiles ++= Seq(
  baseDirectory.value / "lib"
)

packageJson := {
  import play.api.libs.json._

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
      "atom-languageclient" -> "0.8.2",
      "atom-package-deps" -> "4.6.1",
      "find-java-home" -> "0.2.0"
    ),
    "package-deps" -> Json.arr(
      "language-scala",
      "atom-ide-ui"
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
      "code-highlight" -> Json.obj(
        "versions" -> Json.obj("0.1.0" -> "provideCodeHighlight")
      ),
      "code-actions" -> Json.obj(
        "versions" -> Json.obj("0.1.0" -> "provideCodeActions")
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
    )
  )

  sLog.value.info(s"Writing package.json ...")
  val file = baseDirectory.value / "package.json"
  IO.write(file, Json.prettyPrint(json))
  file
}

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

// Main task that packages this Atom plugin
sbt.Keys.`package` in Compile :=
  packageBin.in(Compile)
    .dependsOn(getCoursier)
    .value

def tagAndPublish(ver: String): Def.Initialize[Task[Unit]] = Def.taskDyn {
  import sys.process._
  val log = streams.value.log
  val tagName = s"v${ver}"

  def git(args: String*) = ("git" +: args).!(log)

  val changelog = baseDirectory.value / "CHANGELOG.md"
  if (!changelog.exists || IO.read(changelog).isEmpty)
    sys.error("CHANGELOG.md is not found or is empty")

  val releaseNotes = baseDirectory.value / "notes" / s"${ver}.markdown"
  IO.copy(Map(changelog -> releaseNotes))
  git("add", "--force", releaseNotes.getPath)
  git("commit", "--quiet", "-m", s"Added release notes ${tagName}")

  // Prepare commit on detached HEAD
  git("checkout", "--quiet", "--detach", "HEAD")
  git("add", "--force",
    packageBin.in(Compile).value.getPath,
    packageJson.value.getPath,
    getCoursier.value.getPath,
    changelog.getPath
  )
  git("status", "-s")
  git("commit", "--quiet", "-m", s"Prepared ${tagName} release")
  git("log", "--oneline", "-1")

  // Tag and push to Github
  git("tag", "--annotate", s"--file=${releaseNotes.getPath}", tagName)
  git("push", "--porcelain", "origin", tagName)

  // Publish to Atom.io
  val exitCode = Seq("apm", "publish", "--tag", tagName).!(log)
  if (exitCode == 0) Def.task {
    ohnosequences.sbt.GithubRelease.defs.githubRelease(tagName).value
    Seq("apm", "view", "ide-scala").!(log)
    git("checkout", "--quiet", "-")
    IO.write(changelog, "")
  } else Def.task {
    // Revert the tag
    git("checkout", "--quiet", "-")
    git("push", "-d", "--porcelain", "origin", tagName)
    git("tag",  "-d", tagName)

    sys.error("apm publish failed")
  }
}

publish := Def.taskDyn {
  dynverAssertVersion.value
  tagAndPublish(version.value)
}.value

// Our Git tags are not on the master branch, so we manually set GitDescribeOutput using the latest tag and counting the distance from it
def modifiedGitDescribe: sbtdynver.GitDescribeOutput = {
  import sbtdynver._
  import sys.process._

  def git(args: String*): String = ("git" +: args).!!.trim

  val latestTagHash = git("rev-list", "--tags", "--max-count=1")
  val latestTagName = git("describe", "--tags", latestTagHash)
  // number of commits reachable from HEAD, but not the latest tag:
  val distance = git("rev-list", "HEAD", s"^${latestTagHash}", "--count")
  val headSHA = git("rev-parse", "--short=8", "HEAD")
  val hasChanges = git("status", "--porcelain").nonEmpty

  GitDescribeOutput(
    GitRef(latestTagName),
    GitCommitSuffix(distance.toInt, headSHA),
    GitDirtySuffix(if (hasChanges) "-SNAPSHOT" else "")
  )
}

dynverGitDescribeOutput in ThisBuild := Some(modifiedGitDescribe)
dynver in ThisBuild := modifiedGitDescribe.version

isVersionStable in ThisBuild := {
  dynverGitDescribeOutput.value
    .map { _.commitSuffix.distance == 0 }
    .getOrElse(false)
}

def nextVersion(current: String): complete.Parser[String] = {
  import complete.DefaultParsers._

  val semver = """v?([0-9]+)\.([0-9]+)\.([0-9]+)([-+].*)?""".r
  def bumper(bump: String) = {
    val next = current match {
      case semver(maj, min, pat, _) => bump match {
        case "major" => s"${maj.toInt + 1}.0.0"
        case "minor" => s"${maj}.${min.toInt + 1}.0"
        case "patch" => s"${maj}.${min}.${pat.toInt + 1}"
      }
      case _ => sys.error("Current version is not semantic")
    }
    tokenDisplay(
      bump ^^^ next,
      s"${bump} (${next})"
    )
  }

  Space ~> oneOf(Seq("major", "minor", "patch").map(bumper))
}

commands += Command("release")(_ => nextVersion(version.value)) { (state0, newVersion) =>
  import scala.io.AnsiColor._
  state0.log.info(s"Releasing ${BOLD}v${newVersion}${RESET}...")

  val state1 = Project.extract(state0).append(Seq(version := newVersion), state0)
  val state2 = Project.extract(state1).runTask(publish in Compile, state1)._1
  state2
}

ghreleaseAssets := Seq(
  (artifactPath in (Compile, fullOptJS)).value,
  packageJson.value
)
