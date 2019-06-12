#!/usr/bin/env node
const shell = require("shelljs");
const jsonfile = require("jsonfile");
const chalk = require("chalk");
const file = `${__dirname}/default.json`;
let jsonObj = jsonfile.readFileSync(file);
//设置命令行参数
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
	.option("defalutValue", {
		alias: "d",
		describe: "get the current default value ",
		boolean: true,
		type: "boolean"
	})
	.option("tdefalut", {
		describe: "set default value for the target branch",
		type: "string"
	})
	.option("bdefalut", {
		describe: "set default value for whether to package locally ",
		type: "boolean"
	})
	.usage("Usage: ssgit [options] or ssgit message[string]")
	.example(" ssgit fix:change number ")
	.alias("h", "help")
	.alias("v", "version").argv;
//获取当前所在分支,必须要使用trim,否则会出现意外的字符换行,导致脚本不能正常运行
argv.s = shell.exec("git rev-parse --abbrev-ref HEAD").trim();
//修改默认值
if (argv.tdefalut !== undefined || argv.bdefalut !== undefined) {
	if (argv.tdefalut !== undefined) {
		jsonObj = { ...jsonObj, target: argv.tdefalut };
	}
	if (argv.bdefalut !== undefined) {
		jsonObj = { ...jsonObj, build: argv.bdefalut };
	}
	jsonfile.writeFileSync(file, jsonObj);
	console.log(chalk.green.bold("modify has been applied"));
	let obj = {};
	obj.target = jsonObj.target;
	obj.build = jsonObj.build;
	console.log("current defalut Value is: ", obj);
	return;
}
//输出默认值
if (argv.d) {
	let obj = {};
	obj.target = jsonObj.target;
	obj.build = jsonObj.build;
	console.log("defalutValue: ", obj);
	return;
}
//设置目标分支
argv.t = argv.t!==undefined?argv.t:jsonObj.target;
if (!argv.c) {
	//未发生冲突时,要随时更新prevtarget
	jsonObj = { ...jsonObj, prevtarget: argv.s };
} else {
	//发生冲突时,target的值要从prevtarget取
	argv.t = jsonObj.prevtarget;
}
//设置是否本地打包
argv.b = argv.b !== undefined ? argv.b:jsonObj.build;
//设置提交信息
argv.m = argv._.join(" ");
//切换分支操作提交信息必填
if (!(argv.bdefalut !== undefined || argv.tdefalut !== undefined || argv.defalutValue)) {
	if (argv._.length === 0) {
		throw new Error(chalk.red.bold("Please enter commit information "));
	}
}
//设置分支切换时的命令
let order = "";
if (argv.c) {
	order = `${
		argv.b
			? "npm run build&&git add -A&&git commit  -m " + argv.m + "&&git push&&git checkout " + argv.t
			: "(git add -A&&git commit  -m " + argv.m + "&&git push&&git checkout " + argv.t + ")||(git push&&git checkout " + argv.t + ")"
	}`;
} else {
	order = `(git pull&&
    git add -A&&
    git commit -m ${argv.m}&&
		git push&&
		git checkout ${argv.t}&&
    git pull&&
    git merge ${argv.s} -m ${argv.m}&&
    ${argv.b ? "npm run build&&git add -A&&git commit  -m " + argv.m+"&&" : ""}
		git push&&
    git checkout ${argv.s})||
		(git push&&
		git checkout ${argv.t}&&
    git pull&&
    git merge ${argv.s} -m ${argv.m}&&
    ${argv.b ? "npm run build&&git add -A&&git commit  -m " + argv.m+"&&" : ""}
    git push&&
    git checkout ${argv.s})`;
}
//输出命令到控制台
console.log(chalk.green(`${order}`));
//执行命令
shell.exec(order);
if (!argv.c) {
	//更新文件中的prevtarget的值,将写操作放在末尾,可以避免阻塞分支的切换
	jsonfile.writeFileSync(file, jsonObj);
}
