const shell = require('shelljs')

if (!shell.which('git')) {
  shell.echo('Error: git is required')
  shell.exit(1)
}

if (shell.exec('git clone git@github.com:unrealsolver/frame3dd.git').code !== 0) {
  shell.echo('Error: Git commit failed')
  shell.exit(1)
}
