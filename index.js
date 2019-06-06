#!/usr/bin/env node
var shell = require("shelljs");
var argv = require('yargs')
  .option('target', {
    alias : 't',
    demand: true,
    default: 't',
    describe: 'target branch',
    type: 'string'
  })
  .option('source', {
    alias : 's',
    demand: true,
    describe: 'source branch',
    type: 'string'
  })
  .option('commitAndMerge', {
    alias: 'm',
    demand: true,
    describe: 'message about commit&merge',
    type: 'string'
  })
  .option('conflict', {
    alias: 'c',
    demand: true,
    boolean: true,
    default: false,
    describe: 'Whether conflicts have been resolved',
    type: 'string'
  })
  .option('build', {
    alias: 'b',
    demand: true,
    boolean: true,
    default: false,
    describe: 'Whether to pack locally',
    type: 'string'
  })
  .usage('Usage: wptgit [options]')
  .example(" wptgit -t=t -s=feature/search -m='commit' ")
  .alias('h', 'help')
  .argv;

let order = '';

if (argv.c) {
  order = `${
    argv.b ? 'npm run build&&git add -A&&git commit  -m ' + argv.m + '&&git push&&git checkout ' + argv.s : 
    '(git add -A&&git commit  -m ' + argv.m + '&&git push&&git checkout ' + argv.s+')||(git push&&git checkout '+ argv.s+')'
  }`
} else {
  order =`(git pull&&
    git add -A&&
    git commit  -m  ${argv.m}&&
    git push&&git checkout ${argv.t}&&
    git pull&&
    git merge ${argv.s} -m ${argv.m}&&
    ${argv.b?'npm run build&&git add -A&&git commit  -m '+argv.m:'npm -v'}&&
    git push&&
    git checkout ${argv.s})||
    (git checkout ${argv.t}&&
    git pull&&
    git merge ${argv.s} -m ${argv.m}&&
    ${argv.b?'npm run build&&git add -A&&git commit  -m '+argv.m:'npm -v'}&&
    git push&&
    git checkout ${argv.s})`
};
console.log(order);
shell.exec(order);
