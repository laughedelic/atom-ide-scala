package laughedelic.atom.ide.scala

import scala.scalajs.js, js.Dynamic.global, js.JSConverters._
import scala.scalajs.js.Dictionary
import laughedelic.atom.{ Atom, ConfigChange }
import laughedelic.atom.config._

object Config extends ConfigSchema {

  val serverType = new Setting[String](
    title = "Language Server",
    default = ServerType.Metals.name,
    order = 1,
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

  // TODO: uncomment this when there is more than 1 server
  // override def init(prefix: String): ConfigSchema = {
  //   val schema = super.init(prefix)
  //   // This toggles server version depending on the chosen server type
  //   serverType.onDidChange({ change: SettingChange[String] =>
  //     for {
  //       oldValue <- change.oldValue
  //       oldST <- ServerType.fromName(oldValue)
  //         // NOTE: if the version is changed, we don't want to overwrite it
  //         if oldST.defaultVersion == Config.serverVersion.get
  //       newST <- ServerType.fromName(change.newValue)
  //     } yield
  //       Config.serverVersion.set(newST.defaultVersion)
  //   })
  //   schema
  // }
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

  val sbt = new SettingsGroup(
    title = "sbt server integration",
    schema = Sbt
  )
  object Sbt extends ConfigSchema {
    val enabled = new Setting[Boolean](
      default = false,
      title = "Use sbt server to run a command on file save and report diagnostics",
      description = "⚠️ EXPERIMENTAL: requires sbt v1.1, which you have to launch manually",
      order = 1,
    )
    val command = new Setting[String](
      default = "test:compile",
      title = "Which sbt command to run on file save"
    )
  }

  val scalac = new SettingsGroup(
    title = "Presentation compiler",
    schema = Scalac
  )
  object Scalac extends ConfigSchema {
    val enabled = new Setting[Boolean](
      default = false,
      title =
        "Enable squigglies and completions as you type with the Scala Presentation Compiler",
      description = "⚠️ EXPERIMENTAL: not stable",
      order = 1,
    )
  }

  val scalafmt = new SettingsGroup(
    title = "Code formatting with Scalafmt",
    schema = Scalafmt
  )
  object Scalafmt extends ConfigSchema {
    val enabled = new Setting[Boolean](
      default = true,
      title = "Enable formatting with Scalafmt",
      order = 1,
    )
    val onSave = new Setting[Boolean](
      default = false,
      title = "Format file before saving it",
      description = "⚠️ EXPERIMENTAL: not supported in Atom yet",
      order = 2,
    )
    val version = new Setting[String](
      default = "1.4.0",
      title =
        "Version of Scalafmt to use"
    )
    val confPath = new Setting[String](
      default = ".scalafmt.conf",
      title =
        "Path to the Scalafmt configuration, relative to the workspace path"
    )
  }

  val scalafix = new SettingsGroup(
    title = "Code linting with Scalafix",
    schema = Scalafix
  )
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

  val search = new SettingsGroup(
    title = "Symbols search index",
    schema = Search
  )
  object Search extends ConfigSchema {
    val indexClasspath = new Setting[Boolean](
      default = true,
      title = "Enable indexing of the classpath"
    )
    val indexJDK = new Setting[Boolean](
      default = false,
      title = "Enable indexing of the JDK",
      description = "⚠️ EXPERIMENTAL",
    )
  }

  val hover = new SettingsGroup(
    title = "Tooltips on hover",
    schema = Hover
  )
  object Hover extends ConfigSchema {
    val enabled = new Setting[Boolean](
      default = true,
      title = "Enable tooltips on hover",
      order = 1,
    )
  }

  val rename = new SettingsGroup(
    title = "Renaming symbols",
    schema = Rename
  )
  object Rename extends ConfigSchema {
    val enabled = new Setting[Boolean](
      default = true,
      title = "Enable renaming symbols",
      description = "⚠️ EXPERIMENTAL: not supported in Atom yet",
    )
  }

}
