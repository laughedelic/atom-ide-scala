package laughedelic.atom.ide.scala

import scala.scalajs.js, js.Dynamic.global
import scala.scalajs.js.Dictionary
import laughedelic.atom.{ Atom, ConfigChange }
import laughedelic.atom.config._

object ServerTypes {
  val Scalameta = new AllowedValue[String](
    value = "scalameta",
    description = "Scalameta"
  )

  val Ensime = new AllowedValue[String](
    value = "ensime",
    description = "ENSIME (experimental)"
  )
}

object Config extends ConfigSchema {

  val serverType = new Setting[String](
    title = "Language Server Type",
    description = "Don't change this option unless you know what you're doing",
    default = ServerTypes.Scalameta.value,
    order = 1,
    enum = js.Array(
      ServerTypes.Scalameta,
      ServerTypes.Ensime
    ),
  )

  val serverVersion = new Setting[String](
    title = "Language Server Version",
    default = "5ddb92a9",
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

}
