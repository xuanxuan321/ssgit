#!/usr/bin/env node
const shell = require("shelljs");
const jsonfile = require("jsonfile");
const chalk = require("chalk");
const file = `${__dirname}/default.json`;
let jsonObj = jsonfile.readFileSync(file);

const argv = require("yargs")
	.option("target", {
		alias: "t",
		describe: "target branch, default value is t",
		type: "string"
	})
	.option("conflict", {
		alias: "c",
		boolean: true,
		type: "boolean",
		describe: "Whether conflicts have been resolved"
	})
	.option("build", {
		alias: "b",
		boolean: true,
		describe: "Whether to pack locally, default value is false",
		type: "boolean"
	})
	.option("tdefalut", {
		describe: "set default value for the target branch",
		type: "string"
	})
	.option("bdefalut", {
		describe: "set default value for whether to package locally ",
		type: "boolean",
		boolean: true
	})
	.usage("Usage: ssgit [options] or ssgit message[string]")
	.example(" ssgit fix:change number ")
	.alias("h", "help")
	.alias("v", "version").argv;
//更改默认值
if (argv.bdefalut || argv.tdefalut) {
	if (argv.tdefalut) {
		jsonObj = { ...jsonObj, target: argv.tdefalut };
	}
	if (argv.bdefalut) {
		jsonObj = { ...jsonObj, build: argv.bdefalut };
	}
	jsonfile.writeFileSync(file, jsonObj);
}
//获取当前所在分支,必须要使用trim,否则会出现意外的字符换行,导致脚本不能正常运行
argv.s = shell.exec("git rev-parse --abbrev-ref HEAD").trim();
argv.t = argv.t || jsonObj.target;
argv.b = argv.b === undefined ? jsonObj.build : argv.b;
//设置提交信息
argv.m = argv._.join(" ");
//非配置默认
if (!(argv.bdefalut || argv.tdefalut)) {
	if (argv._.length === 0) {
		throw new Error(chalk.red.bold("Please enter commit information "));
	}
}
//设置分支切换时的命令
let order = "";
if (argv.c) {
	order = `${
		argv.b
			? "npm run build&&git add -A&&git commit  -m " + argv.m + "&&git push&&git checkout " + argv.s
			: "(git add -A&&git commit  -m " + argv.m + "&&git push&&git checkout " + argv.s + ")||(git push&&git checkout " + argv.s + ")"
	}`;
} else {
	order = `(git pull&&
    git add -A&&
    git commit -m ${argv.m}&&
		git push&&
		git checkout ${argv.t}&&
    git pull&&
    git merge ${argv.s} -m ${argv.m}&&
    ${argv.b ? "npm run build&&git add -A&&git commit  -m " + argv.m : "npm -v"}&&
		git push&&
    git checkout ${argv.s})||
		(git push&&
		git checkout ${argv.t}&&
    git pull&&
    git merge ${argv.s} -m ${argv.m}&&
    ${argv.b ? "npm run build&&git add -A&&git commit  -m " + argv.m : "npm -v"}&&
    git push&&
    git checkout ${argv.s})`;
}
// console.log(chalk.red(`${argv.b} ${argv.c} ${argv.m}`));
console.log(chalk.green(`${order}`));
shell.exec(order)
