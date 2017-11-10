const {AutoLanguageClient} = require('atom-languageclient');
const path = require('path');
const cp = require('child_process');

class ScalametaLanguageClient extends AutoLanguageClient {
  getGrammarScopes () { return [ 'source.scala' ] }
  getLanguageName () { return 'Scala' }
  getServerName () { return 'scalameta' }

  startServerProcess (projectPath) {
    const javaHome = cp.execSync('/usr/libexec/java_home').toString().trim();
    const toolsJar = path.join(javaHome, 'lib', 'tools.jar');

    const coursierJar = path.join(__dirname, '..', 'coursier');
    const coursierArgs = [
      'launch', '--quiet',
      '--repository', 'bintray:dhpcs/maven',
      '--repository', 'sonatype:releases',
      '--extra-jars', toolsJar,
      'org.scalameta:metaserver_2.12:0.1-SNAPSHOT',
      '--main', 'scala.meta.languageserver.Main'
    ];

    const javaBin = path.join(javaHome, 'bin', 'java');
    const logLevel = 'DEBUG';
    const javaArgs = [
      `-Dvscode.workspace=${projectPath}`,
      `-Dvscode.logLevel=${logLevel}`,
      '-jar', coursierJar
    ].concat(coursierArgs);

    console.log(javaArgs.join(' '));

    const serverProcess = cp.spawn(javaBin, javaArgs);
    this.captureServerErrors(serverProcess)
    serverProcess.on('exit', exitCode => {
      this.handleSpawnFailure(this.processStdErr);
    });
    return serverProcess;
  }

  filterChangeWatchedFiles (filePath) {
    const match = filePath.match(/\.(semanticdb|compilerconfig)$/i);
    return (match != null);
  }
}

module.exports = new ScalametaLanguageClient();
