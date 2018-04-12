package laughedelic.atom.ide.scala

import scala.scalajs.js, js.Dynamic.global, js.JSConverters._
import scala.scalajs.js.Dictionary
import laughedelic.atom.{ Atom, ConfigChange, NotificationOptions }
import laughedelic.atom.config._

object Config extends ConfigSchema {

  val serverType = new Setting[String](
    title = "Language Server",
    default = ServerType.Metals.name,
    enum = js.Array(new AllowedValue(
      ServerType.Metals.name,
      ServerType.Metals.description
    ))
    // TODO: uncomment this when ENSIME support is ready for beta
    // enum = ServerType.values.map { st =>
    //   new AllowedValue(st.name, st.description)
    // }.toJSArray,
  )

  val serverVersion = new Setting[String](
    title = "Language Server Version",
    default = ServerType.Metals.defaultVersion,
  )

  val metals = new SettingsGroup(MetalsConfig,
    title = "Metals Configuration",
    collapsed = true,
  )

  val java = new SettingsGroup(JavaConfig,
    title = "Java Configuration",
    collapsed = true,
  )

  override def init(prefix: String): ConfigSchema = {
    val schema = super.init(prefix)
    // TODO: uncomment this when there is more than 1 server
    // // This toggles server version depending on the chosen server type
    // serverType.onDidChange({ change: SettingChange[String] =>
    //   for {
    //     oldValue <- change.oldValue
    //     oldST <- ServerType.fromName(oldValue)
    //       // NOTE: if the version is changed, we don't want to overwrite it
    //       if oldST.defaultVersion == Config.serverVersion.get
    //     newST <- ServerType.fromName(change.newValue)
    //   } yield
    //     Config.serverVersion.set(newST.defaultVersion)
    // })

    metals.scalafmt.onSave.onDidChange { change =>
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
          // metals.scalafmt.onSave.set(false)
        }
      }
    }
    schema
  }
}

object JavaConfig extends ConfigSchema {
  val extraArgs = new Setting[js.Array[String]](
    title = "Extra JVM options",
    default = js.Array()
  )

  val home = new Setting[String](
    title = "Java Home",
    description = "Plugin will try to guess your Java Home path, but if you have a very specific setup you can use this option to set it explicitly",
    default = "",
  )
}

object MetalsConfig extends ConfigSchema {

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
    )
  }

  val sbt = new SettingsGroup(Sbt, "sbt server integration")
  object Sbt extends ConfigSchema {
    val diagnostics = new SettingsGroup(Diagnostics, "Diagnostics on save")
    object Diagnostics extends ConfigSchema {
      val enabled = new Setting[Boolean](
        default = true,
        title = "Enable diagnostics from the sbt server",
        description = "⚠️ EXPERIMENTAL: requires sbt v1.1+ (launch it manually)",
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
      title =
        "Path to the Scalafix configuration, relative to the workspace path"
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
      title = "Format file before saving it"
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

}
