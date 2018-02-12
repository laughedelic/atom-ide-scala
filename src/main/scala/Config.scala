package laughedelic.atom.ide.scala

import scala.scalajs.js, js.Dynamic.global, js.JSConverters._
import scala.scalajs.js.Dictionary
import laughedelic.atom.{ Atom, ConfigChange }
import laughedelic.atom.config._

object Config extends ConfigSchema {

  val serverType = new Setting[String](
    title = "Language Server Type",
    description = "Don't change this option unless you know what you're doing",
    default = ServerType.Metals.name,
    order = 1,
    enum = ServerType.values.map { st =>
      new AllowedValue(st.name, st.description)
    }.toJSArray,
  )

  val serverVersion = new Setting[String](
    title = "Language Server Version",
    default = ServerType.Metals.defaultVersion,
    order = 2,
  )

  val metals = new SettingsGroup(
    title = "Metals Configuration",
    order = 3,
    collapsed = true,
    schema = MetalsConfig
  )

  val java = new SettingsGroup(
    title = "Java Configuration",
    order = 4,
    collapsed = true,
    schema = JavaConfig
  )

  override def init(prefix: String): ConfigSchema = {
    val schema = super.init(prefix)
    // This toggles server version depending on the chosen server type
    serverType.onDidChange({ change: SettingChange[String] =>
      for {
        oldValue <- change.oldValue
        oldST <- ServerType.fromName(oldValue)
          // NOTE: if the version is changed, we don't want to overwrite it
          if oldST.defaultVersion == Config.serverVersion.get
        newST <- ServerType.fromName(change.newValue)
      } yield
        Config.serverVersion.set(newST.defaultVersion)
    })
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

  val sbt = new SettingsGroup(schema = Sbt)
  object Sbt extends ConfigSchema {
    val enabled = new Setting[Boolean](
      default = false,
      title = "Use sbt server to run a command on file save and report diagnostics",
      description = "_EXPERIMENTAL_ (requires sbt 1.1)",
      order = 1,
    )
    val command = new Setting[String](
      default = "test:compile",
      title = "Which sbt command to run on file save"
    )
  }

  val scalac = new SettingsGroup(schema = Scalac)
  object Scalac extends ConfigSchema {
    val enabled = new Setting[Boolean](
      default = false,
      title =
        "Enable squigglies and completions as you type with the Scala Presentation Compiler",
      description = "_EXPERIMENTAL_",
      order = 1,
    )
  }

  val scalafmt = new SettingsGroup(schema = Scalafmt)
  object Scalafmt extends ConfigSchema {
    val enabled = new Setting[Boolean](
      default = true,
      title = "Enable formatting with scalafmt",
      order = 1,
    )
    val onSave = new Setting[Boolean](
      default = false,
      title = "Format file before saving it",
      description = "_EXPERIMENTAL_ (not supported in Atom yet)",
      order = 2,
    )
    val version = new Setting[String](
      default = "1.3.0",
      title =
        "Version of scalafmt to use"
    )
    val confPath = new Setting[String](
      default = ".scalafmt.conf",
      title =
        "Path to the Scalafmt configuration, relative to the workspace path"
    )
  }

  val scalafix = new SettingsGroup(schema = Scalafix)
  object Scalafix extends ConfigSchema {
    val enabled = new Setting[Boolean](
      default = true,
      title = "Enable Scalafix diagnostics",
      order = 1,
    )
    val confPath = new Setting[String](
      default = ".scalafix.conf",
      title =
        "Path to the Scalafix configuration, relative to the workspace path"
    )
  }

  val search = new SettingsGroup(schema = Search)
  object Search extends ConfigSchema {
    val indexClasspath = new Setting[Boolean](
      default = true,
      title = "Enable indexing of the classpath"
    )
    val indexJDK = new Setting[Boolean](
      default = false,
      title = "Enable indexing of the JDK",
      description = "_EXPERIMENTAL_",
    )
  }

  val hover = new SettingsGroup(schema = Hover)
  object Hover extends ConfigSchema {
    val enabled = new Setting[Boolean](
      default = true,
      title = "Enable tooltips on hover",
      order = 1,
    )
  }

  val rename = new SettingsGroup(schema = Rename)
  object Rename extends ConfigSchema {
    val enabled = new Setting[Boolean](
      default = true,
      title = "Enable renaming symbols",
      order = 1,
    )
  }

}
