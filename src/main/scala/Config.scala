package laughedelic.atom.ide.scala

import scala.scalajs.js, js.JSConverters._
import laughedelic.atom.config._

object Config extends ConfigSchema {

  val autoServer = new Setting[Boolean](
    title = "Choose server based on the project setup",
    description = "Read the usage section below to learn how to setup projects",
    default = true,
  )

  val defaultServer = new Setting[String](
    title = "Default language server",
    description = "This server will be used when project setup is ambiguous or the above option is off",
    default = Metals.name,
    enum = ScalaLanguageServer.values.map { st =>
      new AllowedValue(st.name, st.description)
    }.toJSArray,
  )

  val serverVersion = new Setting[String](
    title = "Language server version",
    default = Metals.defaultVersion,
  )

  val java = new SettingsGroup(JavaConfig,
    title = "Java configuration",
    collapsed = true,
  )

  val metals = new SettingsGroup(MetalsConfig,
    title = "Metals configuration",
    collapsed = true,
  )

  override def postInit(): Unit = {
    // This toggles server version depending on the chosen server type
    defaultServer.onDidChange({ change: SettingChange[String] =>
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
