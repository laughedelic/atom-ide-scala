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

apmJson ~= { _ ++
  Json.obj(
    "enhancedScopes" -> Json.arr(
      "source.scala"
    ),
    "package-deps" -> Json.arr(
      "language-scala",
      "atom-ide-ui"
    )
  )
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
