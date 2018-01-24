package laughedelic.atom.ide.scala

import scala.scalajs.js, js.Dynamic.global
import scala.scalajs.js.Dictionary

trait EnumEntry extends js.Object {
  val value: String
  val description: String
  val defaultVersion: String
}

trait ItemEntry extends js.Object {
  val `type`: String
}

trait Configuration extends js.Object {
  val order: js.UndefOr[Int]
  val `type`: String
  val title: String
  val description: js.UndefOr[String]
  val default: js.UndefOr[js.Any]
  val enum: js.UndefOr[js.Array[EnumEntry]]
  val properties: js.UndefOr[js.Dictionary[Configuration]]
  val items: js.UndefOr[ItemEntry]
}

trait PluginConfiguration extends js.Object {
  val serverType: Configuration
  val serverVersion: Configuration
  val jvm: Configuration
}

object PluginConfiguration {

  val ScalametaServerType = new EnumEntry {
    val value = "scalameta"
    val description = "Scalameta"
    val defaultVersion = "5ddb92a9"
  }

  val EnsimeServerType = new EnumEntry {
    val value = "ensime"
    val description = "ENSIME (experimental)"
    val defaultVersion = "3.0.0-SNAPSHOT"
  }

  val ServerTypes = List(ScalametaServerType, EnsimeServerType)

  val DefaultServerType = new Configuration {
    val order = 1
    val `type` = "string"
    val title = "Language Server Type"
    val description = "Don't change this option unless you know what you're doing"
    val default = js.defined("scalameta")
    val enum = js.Array[EnumEntry](ServerTypes: _*)
    val properties = js.undefined
    val items = js.undefined
  }

  val DefaultServerVersion = new Configuration {
    val order = 2
    val `type` = "string"
    val title = "Language Server Version"
    val description = js.undefined
    val default = js.defined("5ddb92a9")
    val enum = js.undefined
    val properties = js.undefined
    val items = js.undefined
  }

  val JavaOptsProps = new Configuration {
    val order = js.undefined
    val `type` = "array"
    val title = "Extra JVM options"
    val description = js.undefined
    val default = js.defined(js.Array())
    val enum = js.undefined
    val properties = js.undefined
    val items = new ItemEntry { val `type` = "string" }
  }

  val JavaHomeProps = new Configuration {
    val order = js.undefined
    val `type` = "string"
    val title = "Java Home"
    val description = "Plugin will try to guess your Java Home path, but if you have a very specific setup you can use this option to set it explicitly"
    val default = js.defined("")
    val enum = js.undefined
    val properties = js.undefined
    val items = js.undefined
  }

  val DefaultJVM = new Configuration {
    val order = 3
    val `type` = "object"
    val title = "Java-related settings"
    val description = js.undefined
    val default = js.undefined
    val enum = js.undefined
    val properties = js.Dictionary[Configuration]("javaHome" -> JavaHomeProps, "javaOpts" -> JavaOptsProps)
    val items = js.undefined
  }

  val Default = new PluginConfiguration {
    val serverType = DefaultServerType
    val serverVersion = DefaultServerVersion
    val jvm = DefaultJVM
  }


  trait ConfigChange extends js.Object {
    val newValue: js.Any
    val oldValue: js.UndefOr[js.Any]
  }

  global.atom.config.onDidChange("ide-scala.serverType", onChangeServerType _)

  private def onChangeServerType(change: ConfigChange): Unit = {
    change.oldValue.foreach { _ =>
      val newServerType = ServerTypes.find(_.value == change.newValue).get
      global.atom.config.set("ide-scala.serverVersion", newServerType.defaultVersion)
    }
  }
}