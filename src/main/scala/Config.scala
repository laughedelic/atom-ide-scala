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
    enum = (
        ScalaLanguageServer.none +:
        ScalaLanguageServer.values
      ).map { s =>
        new AllowedValue(s.name, s.description)
      }.toJSArray,
  )

  val metals = new SettingsGroup(MetalsConfig,
    title = "Metals configuration",
    collapsed = true,
  )

  val dotty = new SettingsGroup(DottyConfig,
    title = "Dotty configuration",
    collapsed = true,
  )

  val ensime = new SettingsGroup(EnsimeConfig,
    title = "Ensime configuration",
    collapsed = true,
  )

}
