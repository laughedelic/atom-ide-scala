package laughedelic.atom.ide.scala

import scala.scalajs.js
import laughedelic.atom.{ Atom, NotificationOptions }
import laughedelic.atom.config._
import laughedelic.atom.languageclient.{ ActiveServer, ExecuteCommandParams }

object Metals extends ScalaLanguageServer { server =>
  val name: String = "metals"
  val description: String = "Metals"
  val defaultVersion: String = "0.1.0-M1+90-fcac1cc3"

  def trigger(projectPath: String): Boolean = {
    (projectPath / ".metals").isDirectory
  }

  def watchFilter(filePath: String): Boolean = {
    filePath.endsWith(".semanticdb") ||
    filePath.endsWith(".properties") ||
    filePath.endsWith("active.json")
  }

  def coursierArgs(projectPath: String): Seq[String] = Seq(
    "--repository", "bintray:scalameta/maven",
    s"org.scalameta:metals_2.12:${Config.metals.version.get}",
    "--main", "scala.meta.metals.Main"
  )

  val commands = Seq(
    "clearIndexCache",
    "resetPresentationCompiler",
    "sbtConnect",
    // "scalafixUnusedImports",
  ).map { cmd =>
    cmd -> { activeServer: ActiveServer => _: js.Any =>
      activeServer.connection.executeCommand(
        new ExecuteCommandParams(command = cmd)
      )
    }
  }.toMap
}

object MetalsConfig extends ConfigSchema {

  val version = new Setting[String](
    title = "Metals version",
    description = "Set it to `SNAPSHOT` if you're working on Metals and publish it locally",
    default = Metals.defaultVersion,
  )

  val hover = new SettingsGroup(Hover, "Tooltips on hover")
  object Hover extends ConfigSchema {
    val enabled = new Setting[Boolean](
      default = true,
      title = "Enable tooltips on hover",
    )
  }

  val highlight = new SettingsGroup(Highlight, "Symbol highlights")
  object Highlight extends ConfigSchema {
    val enabled = new Setting[Boolean](
      default = false,
      title = "Enable symbol highlights",
      description = "⚠️ EXPERIMENTAL: not stable (may misbehave when editing sources)",
    )
  }

  val sbt = new SettingsGroup(Sbt, "sbt server integration")
  object Sbt extends ConfigSchema {
    val diagnostics = new SettingsGroup(Diagnostics, "Diagnostics on save")
    object Diagnostics extends ConfigSchema {
      val enabled = new Setting[Boolean](
        default = true,
        title = "Enable diagnostics from the sbt server",
        description = "Requires sbt v1.1+ (launch it manually)",
      )
    }
    val command = new Setting[String](
      default = "",
      title = "sbt command to run on file save"
    )
  }

  val scalac = new SettingsGroup(Scalac, "Presentation compiler")
  object Scalac extends ConfigSchema {
    val completions = new SettingsGroup(Completions, "Completions as you type")
    object Completions extends ConfigSchema {
      val enabled = new Setting[Boolean](
        default = false,
        title = "Enable completions with the Scala Presentation Compiler",
        description = "⚠️ EXPERIMENTAL: not stable (use _Reset Presentation Compiler_ command when it stops working)",
      )
    }
    val diagnostics = new SettingsGroup(Diagnostics, "Diagnostics as you type")
    object Diagnostics extends ConfigSchema {
      val enabled = new Setting[Boolean](
        default = false,
        title = "Enable diagnostics with the Scala Presentation Compiler",
        description = "⚠️ EXPERIMENTAL: not stable (use _Reset Presentation Compiler_ command when it stops working)",
      )
    }
  }

  val scalafix = new SettingsGroup(Scalafix, "Code linting with Scalafix")
  object Scalafix extends ConfigSchema {
    val enabled = new Setting[Boolean](
      default = true,
      title = "Enable Scalafix diagnostics (if configuration file is present)",
    )
    val confPath = new Setting[String](
      default = ".scalafix.conf",
      title = "Path to the Scalafix configuration, relative to the workspace path"
    )
  }

  val scalafmt = new SettingsGroup(Scalafmt, "Code formatting with Scalafmt")
  object Scalafmt extends ConfigSchema {
    val enabled = new Setting[Boolean](
      default = true,
      title = "Enable formatting with Scalafmt (if configuration file is present)",
    )
    val onSave = new Setting[Boolean](
      default = false,
      title = "Format file before saving it",
      description = "⚠️ EXPERIMENTAL: Atom feature in development",
    )
    val version = new Setting[String](
      default = "1.4.0",
      title = "Version of Scalafmt to use"
    )
    val confPath = new Setting[String](
      default = ".scalafmt.conf",
      title =
        "Path to the Scalafmt configuration, relative to the workspace path"
    )
  }

  val search = new SettingsGroup(Search, "Symbols search index")
  object Search extends ConfigSchema {
    val indexClasspath = new Setting[Boolean](
      default = true,
      title = "Enable indexing of the classpath"
    )
    val indexJDK = new Setting[Boolean](
      default = true,
      title = "Enable indexing of the JDK"
    )
  }

  // TODO: uncomment when it's supported in Atom IDE
  // val rename = new SettingsGroup(Rename, "Renaming symbols")
  // object Rename extends ConfigSchema {
  //   val enabled = new Setting[Boolean](
  //     default = true,
  //     title = "Enable renaming symbols",
  //     description = "⚠️ EXPERIMENTAL: not supported in Atom yet",
  //   )
  // }

  override def postInit(): Unit = {
    scalafmt.onSave.onDidChange { change =>
      if (change.newValue == true) {
        val ideUiOnSaveRaw =
          Atom.config.get("atom-ide-ui.atom-ide-code-format.formatOnSave")
        val ideUiOnSave = js.defined(
            ideUiOnSaveRaw.asInstanceOf[Boolean]
          ).getOrElse(false)

        if (ideUiOnSave == true) {
          Atom.notifications.addWarning(
            "Scalafmt on Save coflicts with general Format on Save",
            new NotificationOptions(
              dismissable = true,
              description = "General **Format on Save** setting is already enabled. If you want to enable **Scalafmt on Save**, first disable **Format on Save** in the Atom IDE UI settings."
              // TODO: Link to atom://settings-view/show-package?package=atom-ide-ui (now it doesn't work in notifications)
            )
          )
          // TODO: Unset it. This doesn't work for some reason:
          // scalafmt.onSave.set(false)
        }
      }
    }
  }
}
