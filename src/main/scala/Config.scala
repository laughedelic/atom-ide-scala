package laughedelic.atom.ide.scala

import scala.scalajs.js, js.JSConverters._
import laughedelic.atom.config._

object Config extends ConfigSchema {

  val serverType = new Setting[String](
    title = "Language Server",
    description = "Changing this setting requires reload of the plugin",
    default = Metals.name,
    enum = ScalaLanguageServer.values.map { st =>
      new AllowedValue(st.name, st.description)
    }.toJSArray,
  )

  val serverVersion = new Setting[String](
    title = "Language Server Version",
    default = Metals.defaultVersion,
  )

  val metals = new SettingsGroup(MetalsConfig,
    title = "Metals Configuration",
    collapsed = true,
  )

  val java = new SettingsGroup(JavaConfig,
    title = "Java Configuration",
    collapsed = true,
  )

  override def postInit(): Unit = {
    // This toggles server version depending on the chosen server type
    serverType.onDidChange({ change: SettingChange[String] =>
      for {
        oldValue <- change.oldValue
        oldST <- ScalaLanguageServer.fromName(oldValue)
          // NOTE: if the version is changed, we don't want to overwrite it
          if oldST.defaultVersion == Config.serverVersion.get
        newST <- ScalaLanguageServer.fromName(change.newValue)
      } yield
        Config.serverVersion.set(newST.defaultVersion)
    })
  }
}

object JavaConfig extends ConfigSchema {
  val extraArgs = new Setting[js.Array[String]](
    title = "Extra JVM options",
    default = js.Array(
      "-XX:+UseG1GC",
      "-XX:+UseStringDeduplication",
    )
  )
}
