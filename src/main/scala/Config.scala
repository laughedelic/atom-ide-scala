package laughedelic.atom.ide.scala

import scala.scalajs.js, js.Dynamic.global, js.JSConverters._
import scala.scalajs.js.Dictionary
import laughedelic.atom.{ Atom, ConfigChange }
import laughedelic.atom.config._

object Config extends ConfigSchema {

  val serverType = new Setting[String](
    title = "Language Server Type",
    description = "Don't change this option unless you know what you're doing",
    default = ServerType.Scalameta.name,
    order = 1,
    enum = ServerType.values.map { st =>
      new AllowedValue(st.name, st.description)
    }.toJSArray,
  )

  val serverVersion = new Setting[String](
    title = "Language Server Version",
    default = ServerType.Scalameta.defaultVersion,
    order = 2,
  )

  object jvmOpts extends ConfigSchema {
    val javaOpts = new Setting[js.Array[String]](
      title = "Extra JVM options",
      default = js.Array()
    )

    val javaHome = new Setting[String](
      title = "Java Home",
      description = "Plugin will try to guess your Java Home path, but if you have a very specific setup you can use this option to set it explicitly",
      default = "",
    )
  }

  val jvm = new SettingsGroup(
    title = "Java-related settings",
    order = 3,
    collapsed = true,
    schema = jvmOpts
  )

  override def init(prefix: String): ConfigSchema = {
    val schema = super.init(prefix)
    serverType.onDidChange({ change: ConfigChange =>
      ServerType.values
        .find { _.name == change.newValue }
        .foreach { st =>
          Config.serverVersion.set(st.defaultVersion)
        }
    })
    schema
  }
}
