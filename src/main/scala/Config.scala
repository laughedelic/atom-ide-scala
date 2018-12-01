package laughedelic.atom.ide.scala

import scala.scalajs.js, js.JSConverters._
import laughedelic.atom.config._

object Config extends ConfigSchema {

  val autoServer = new Setting[Boolean](
    title = "Choose server based on the project setup",
    description = "If you once used a language server in the project, it will be used there every time you open it again",
    default = true,
  )

  val defaultServer = new Setting[String](
    title = "Default language server",
    description = "This server will be used in new projects or when the above option is off",
    default = ScalaLanguageServer.default.name,
    enum = ScalaLanguageServer.values.map { s =>
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

}
