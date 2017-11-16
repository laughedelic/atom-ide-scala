import org.scalajs.core.tools.linker.standard._

name := "atom-ide-scala"
organization := "laughedelic"
description := "Scala language support for Atom-IDE"

homepage := Some(url(s"https://github.com/${organization.value}/${name.value}"))
scmInfo in ThisBuild := Some(ScmInfo(
  homepage.value.get,
  s"scm:git:git@github.com:${organization.value}/${name.value}.git"
))

licenses := Seq(
  "MIT" -> url("https://opensource.org/licenses/MIT")
)
developers := List(Developer(
  "laughedelic",
  "Alexey Alekhin",
  "laughedelic@gmail.com",
  url("https://github.com/laughedelic")
))

scalaVersion := "2.12.4"
scalacOptions ++= Seq(
  "-encoding", "utf8",
  "-feature",
  "-language:postfixOps",
  "-language:implicitConversions",
  "-language:higherKinds",
  "-unchecked",
  "-deprecation",
  "-Yrangepos",
  "-P:scalajs:sjsDefinedByDefault"
)

enablePlugins(ScalaJSPlugin)
scalaJSLinkerConfig ~= { conf =>
  conf
    .withModuleKind(ModuleKind.CommonJSModule)
    .withOutputMode(OutputMode.ECMAScript2015)
}

libraryDependencies += "io.scalajs" %%% "nodejs" % "0.4.2"

artifactPath in (Compile, fullOptJS) := target.value / "main.js"
artifactPath in (Compile, fastOptJS) := (artifactPath in (Compile, fullOptJS)).value

lazy val apmPublish = inputKey[Unit]("Makes a detached HEAD tag and runs apm publish")

apmPublish := {
  import sys.process._
  import sbt._, complete._, DefaultParsers._

  val nextVersion = (Space ~> oneOf(Seq("major", "minor", "patch").map(literal))).parsed

  val log = streams.value.log
  val mainJs = fullOptJS.in(Compile).value.data

  def HEAD = Seq("git", "rev-parse", "HEAD").!!.trim
  val releaseBranch = s"release/${HEAD}"

  Seq("git", "checkout", "--quiet", "-b", releaseBranch).!(log)
  Seq("git", "add", "--force", mainJs.getPath).!(log)
  Seq("git", "commit", "--quiet", "-m", "Added generated JavaScript").!(log)
  Seq("git", "log", "-1", "--oneline").!(log)

  val exitCode = Seq("apm", "publish", nextVersion).!(log)
  if (exitCode == 0) {
    Seq("apm", "view", "ide-scala").!(log)
    Seq("git", "checkout", "--quiet", "-").!(log)
    Seq("git", "push", "-d", "origin", releaseBranch).!(log)
    Seq("git", "branch", "-D", releaseBranch).!(log)
  } else {
    sys.error("apm publish failed")
  }
}
