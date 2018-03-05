package laughedelic.sbt

import sbt._, Keys._, complete._, DefaultParsers._
import scala.io.AnsiColor._
import play.api.libs.json._
import sbtdynver._, DynVerPlugin.autoImport._

case object AtomPackageVersion extends AutoPlugin {

  override def requires = DynVerPlugin
  override def trigger = noTrigger

  // Our Git tags are not on the master branch, so we manually set GitDescribeOutput using the latest tag and counting the distance from it
  def modifiedGitDescribe: sbtdynver.GitDescribeOutput = {
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

  override def projectSettings = Seq(
    dynverGitDescribeOutput in ThisBuild := Some(modifiedGitDescribe),
    dynver in ThisBuild := modifiedGitDescribe.version,

    isVersionStable in ThisBuild := {
      dynverGitDescribeOutput.value
        .map { _.commitSuffix.distance == 0 }
        .getOrElse(false)
    }
  )

}
