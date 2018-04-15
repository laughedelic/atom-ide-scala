This is a huge release, it includes a lot of improvements and new features 🚀 Here are some highlights:

* Added support for running server commands (through the command palette) (#34)
* Moved configuration to the Scala code (#29) and added a typed API for it (#37)
* Added Metals configuration as a part of the plugin's settings UI (#42)
* Split reusable part of the build into an sbt plugin: [sbt-atom-package](https://github.com/laughedelic/sbt-atom-package) (#17, #44)
* Added support for the logging console UI (#47)
* Added support for the **Dotty language server** (#48)
* Added project setup detection to launch the right server automatically (#53)

See the full list of merged PRs in this release in the [BIG release](https://github.com/laughedelic/atom-ide-scala/milestone/4?closed=1) milestone.

I'd like to thank [@Jarlakxen](https://github.com/Jarlakxen) for contributing to the project. Especially for improving Scala.js facades in the [scalajs-atom-api](https://github.com/laughedelic/scalajs-atom-api) project.
