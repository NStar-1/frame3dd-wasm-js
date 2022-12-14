// emcc -g --pre-js settings.js --post-js post-settings.js -sEXPORTED_FUNCTIONS=_main,_run_3dd -sEXPORTED_RUNTIME_METHODS=ccall,cwrap,callMain src/main.c src/frame3dd.c src/eig.c src/HPGmatrix.c src/HPGutil.c src/NRutil.c src/frame3dd_io.c src/coordtrans.c src/gnuplot_writer.c src/struct_writer.c src/compat_types.c src/core.c -o main.html --preload-file examples/exA.3dd
const shell = require('shelljs')

if (!shell.which('emcc')) {
  shell.echo('Emscripten compiler is required')
  shell.exit(1)
}

const isEmrun = process.env.EMRUN

const srcDir = 'src/'
const f3ddDir = '../frame3dd/'
const f3ddSrcDir = f3ddDir + srcDir
const buildDir = 'build/'
const compileCmd =
`
cd build/ && \
emcc -c -g -sEXPORTED_FUNCTIONS=_init \
${f3ddSrcDir}main.c ${f3ddSrcDir}frame3dd.c ${f3ddSrcDir}eig.c ${f3ddSrcDir}HPGmatrix.c \
${f3ddSrcDir}HPGutil.c ${f3ddSrcDir}NRutil.c ${f3ddSrcDir}frame3dd_io.c \
${f3ddSrcDir}coordtrans.c ${f3ddSrcDir}gnuplot_writer.c ${f3ddSrcDir}struct_writer.c \
${f3ddSrcDir}compat_types.c ${f3ddSrcDir}core.c ../src/ems-interface.c && \
emcc -r -sEXPORTED_FUNCTIONS=_init -o f3dd.o \
main.o frame3dd.o eig.o HPGmatrix.o HPGutil.o NRutil.o frame3dd_io.o coordtrans.o \
gnuplot_writer.o struct_writer.o compat_types.o core.o ems-interface.o && \
emcc -lembind ../src/ems-binding.cpp
`

if (shell.test('-d', buildDir)) {
  shell.rm('-rf', buildDir)
}
shell.mkdir(buildDir)

shell.echo(`$ ${compileCmd}`)

const compileResult = shell.exec(compileCmd, { stdio: 'inherit' })
if (compileResult.code !== 0) {
  shell.echo('Compilation error')
  shell.exit(compileResult)
}

shell.echo('Successfully compiled!')
