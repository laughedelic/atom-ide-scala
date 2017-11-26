package laughedelic.atom.ide.scala

import scala.scalajs.js, js.annotation._, js.Dynamic.global
import scala.concurrent._

object findJavaHome {

  @js.native @JSImport("find-java-home", JSImport.Namespace)
  private object fjh extends js.Object

  // Minimal interface for the imported callback-version
  def withCallback(
    allowJre: Boolean,
    callback: (js.Any, String) => Unit
  ): Unit =
    fjh.asInstanceOf[js.Dynamic].apply(
      js.Dynamic.literal("allowJre" -> allowJre),
      { (err: js.Any, home: String) => callback(err, home) }
    )

  // Wrapped as a Future
  def apply(allowJre: Boolean = false): Future[String] = {
    val p = Promise[String]()
    withCallback(allowJre, { (err, home) =>
      if (err != null) p.failure(throw new RuntimeException(err.toString))
      else p.success(home)
    })
    p.future
  }
}
