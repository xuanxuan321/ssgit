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
		describe: "要合并到的目标分支,默认值是t",
		type: "string"
	})
	.option("conflict", {
		alias: "c",
		boolean: true,
		type: "boolean",
		describe: "合分支时是否遇到冲突,并且已经解决"
	})
	.option("local", {
		alias: "l",
		boolean: true,
		type: "boolean",
		describe: "只简单地提交本地改动到远程,不涉及分支的切换以及合并"
	})
	.option("build", {
		alias: "b",
		boolean: true,
		describe: "是否要在目标分支进行打包, 默认不打包",
		type: "boolean"
	})
	.option("defalutValue", {
		alias: "d",
		describe: "获取当前的默认值",
		boolean: true,
		type: "boolean"
	})
	.option("tdefalut", {
		describe: "修改目标分支的默认值",
		type: "string"
	})
	.option("bdefalut", {
		describe: "修改是否要在目标分支进行打包的默认配置",
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
//为了提交信息支持空格
argv.m = '\'' + argv.m + '\'';
//切换分支操作提交信息必填
// if (!(argv.bdefalut !== undefined || argv.tdefalut !== undefined || argv.defalutValue)) {
	if (argv._.length === 0&&!argv.c) {
		throw new Error(chalk.red.bold("Please enter commit information "));
	}
// }
if (argv.l) {
	let order = `(git add -A&& git commit -m ${argv.m}&& git push) || git push`;
	console.log(chalk.green(order))
	let order2 = `git push -u origin ${argv.s}`;
	//只是提交本地变化并且推送到远程
	shell.exec(order, (error, stdout, stderr) => {
		//判断是否与远程分支关联
		if (/git push origin HEAD/.test(stderr)||/git push --set-upstream/.test(stderr)) {
			console.log(chalk.green(order2))
		shell.exec(order2)
	}
	});
	return
}
//设置分支切换时的命令 
let order = "";
if (argv.c) {
	console.log(chalk.red(argv.m))
	if (argv._.length > 0) {
		order = `${
			argv.b
				? "npm run build&&git add -A&&git commit  -m " + argv.m + "&&git push&&git checkout " + argv.t
				: "(git add -A&&git commit  -m " + argv.m + "&&git push&&git checkout " + argv.t + ")||(git push&&git checkout " + argv.t + ")"
		}`;
	} else {
		let mergeMessage=`'fix: conflict&merge branch ${argv.s} into ${argv.t}'`
		order = `${
			argv.b
				? "npm run build&&git add -A&&git commit  -m " + mergeMessage + "&&git push&&git checkout " + argv.t
				: "(git add -A&&git commit  -m " + mergeMessage + "&&git push&&git checkout " + argv.t + ")||(git push&&git checkout " + argv.t + ")"
		}`;
	}
	
} else {
	let mergeMessage = `'Merge branch ${argv.s} into ${argv.t}'`
	// qie换到t的时候没有去合master出于两种情况考虑
	// 1 之前基本只用t，没有那么多的t环境
	// 2 不好判断冲突来自于哪一方，是自己的分支还是develop分支
	order = `(
    git add -A&&
    git commit -m ${argv.m}&&
    git push&&
    git checkout ${argv.t}&&
    git pull&&
    git merge ${argv.s} -m ${mergeMessage}&&
    ${argv.b ? "npm run build&&git add -A&&git commit  -m " + argv.m+"&&" : ""}
    git push&&
    git checkout ${argv.s})||
    (git push&&
    git checkout ${argv.t}&&
    git pull&&
    git merge ${argv.s} -m ${mergeMessage}&&
    ${argv.b ? "npm run build&&git add -A&&git commit  -m " + argv.m+"&&" : ""}
    git push&&
    git checkout ${argv.s})`;
}
//输出命令到控制台
console.log(chalk.green(order))
//执行命令
shell.exec(order, (error, stdout, stderr) => {
	//判断是否与远程分支关联
	//当分支是从本地分支拉的时候，错误提示信息中会包含git push --set-upstream，当分支是从远程分支（比如master）拉的时候，错误提示信息中会包含git push origin HEAD
	if (/git push origin HEAD/.test(stderr)||/git push --set-upstream/.test(stderr)) {
		let mergeMessage=`'Merge branch ${argv.s} into ${argv.t}'`
		let order2=`git push -u origin ${argv.s}&&
			git checkout ${argv.t}&&
			git pull&&
			git merge ${argv.s} -m ${mergeMessage}&&
			${argv.b ? "npm run build&&git add -A&&git commit  -m " + argv.m+"&&" : ""}
			git push&&
			git checkout ${argv.s}`
			console.log(chalk.green(order2))
		shell.exec(order2)
	}
});
if (!argv.c) {
	//更新文件中的prevtarget的值,将写操作放在末尾,可以避免阻塞分支的切换
	jsonfile.writeFileSync(file, jsonObj);
}
