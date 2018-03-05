package laughedelic.sbt

import sbt._, Keys._, complete._, DefaultParsers._
import scala.io.AnsiColor._
import play.api.libs.json._
import AtomPackageJson.autoImport._

case object AtomPackageRelease extends AutoPlugin {

  override def requires = AtomPackageJson
  override def trigger = noTrigger

  case object autoImport {

    lazy val apmChangelog = settingKey[File]("Changelog file that will be bundled with the release")
    lazy val apmExtraFiles = taskKey[Seq[File]]("Git ignored files to add to the release")
  }
  import autoImport._

  def tagAndPublish(ver: String): Def.Initialize[Task[Unit]] = Def.taskDyn {
    import sys.process._
    val log = streams.value.log
    val tagName = s"v${ver}"

    def git(args: String*) = ("git" +: args).!(log)

    val changelog = apmChangelog.value
    if (!changelog.exists || IO.read(changelog).isEmpty)
      sys.error("CHANGELOG.md is not found or is empty")

    val releaseNotes = baseDirectory.value / "notes" / s"${ver}.markdown"
    IO.copy(Map(changelog -> releaseNotes))
    git("add", "--force", releaseNotes.getPath)
    git("commit", "--quiet", "-m", s"Added release notes ${tagName}")

    // Prepare commit on detached HEAD
    git("checkout", "--quiet", "--detach", "HEAD")
    git("add" +: "--force" +: apmExtraFiles.value.map(_.getPath): _*)
    git("status", "-s")
    git("commit", "--quiet", "-m", s"Prepared ${tagName} release")
    git("log", "--oneline", "-1")

    // Tag and push to Github
    git("tag", "--annotate", s"--file=${releaseNotes.getPath}", tagName)
    git("push", "--porcelain", "origin", tagName)

    // Publish to Atom.io
    val exitCode = Seq("apm", "publish", "--tag", tagName).!(log)
    if (exitCode == 0) Def.task {
      Seq("apm", "view", "ide-scala").!(log)
      git("checkout", "--quiet", "-")
    } else Def.task {
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

  override def projectSettings = Seq(
    apmChangelog := baseDirectory.value / "CHANGELOG.md",
    apmExtraFiles := Seq(
      apmMain.value,
      apmJsonFile.value,
      apmChangelog.value
    ),

    publish := Def.taskDyn {
      // dynverAssertVersion.value
      tagAndPublish(version.value)
    }.value,

    commands += Command("release")(_ => nextVersion(version.value)) { (state0, newVersion) =>
      import scala.io.AnsiColor._
      state0.log.info(s"Releasing ${BOLD}v${newVersion}${RESET}...")

      val state1 = Project.extract(state0).append(Seq(version := newVersion), state0)
      val state2 = Project.extract(state1).runTask(publish in Compile, state1)._1
      state2
    }
  )

}
