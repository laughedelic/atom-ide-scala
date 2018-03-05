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

enablePlugins(AtomPackagePlugin)

resolvers += Resolver.jcenterRepo

libraryDependencies ++= Seq(
  "io.scalajs" %%% "nodejs" % "0.4.2",
  "laughedelic" %%% "scalajs-atom-api" % "0.3.0"
)
