## 安装
```
npm i -g ssgit
```

## 介绍
在日常生活中,分支的切换以及合并是相当频繁且繁琐的一件事,比如你当前在feature/add分支,此时你需要将你的改动推送到远程的t分支
然后再切换回源分支(feature/add),考虑到你的分支可能还有其他人在开发,你需要经历以下操作
```
git pull  
git add -A 
git commit -m 'fix:bug‘
git push
git checkout t
git pull
git merge feature/search -m 'fix:bug'
git push
git checkout feature/search 
```
有的时候在t分支上进行merge操作时,会有冲突,解决完冲突,还要打包,这样又会有一些额外的操作...
现在,通通交给ssgit就行了,简单的 *`ssgit 'fix:bug'`*,就能将上述的操作全部执行完(提交信息可以不加引号,同时支持空格分隔),
你不需要关注你当前的分支处于什么状态,不管是未暂存,未提交还是未推送等等,*`ssgit`* 全部都能兼容

## 使用方式
Usage: ssgit [options] or ssgit message[string]

选项：
  --target, -t &nbsp; &nbsp;       要合并到的目标分支,默认值是t &nbsp; &nbsp;                [字符串]

  --conflict, -c &nbsp; &nbsp;      合分支时是否遇到冲突,并且已经解决  &nbsp; &nbsp;              [布尔]

  --local, -l   &nbsp; &nbsp;      只简单地提交本地改动到远程,不涉及分支的切换以及合并  &nbsp; &nbsp;            [布尔]

  --build, -b  &nbsp; &nbsp;       是否要在目标分支进行打包, 默认不打包  &nbsp; &nbsp;    [布尔]

  --defalutValue, -d&nbsp; &nbsp;  获取当前的默认值  &nbsp; &nbsp;                     [布尔]

  --tdefalut  &nbsp; &nbsp;        修改目标分支的默认值 &nbsp; &nbsp;          [字符串]

  --bdefalut &nbsp; &nbsp;         修改是否要在目标分支进行打包的默认配置 &nbsp; &nbsp;   [布尔]

  -h, --help&nbsp; &nbsp;          显示帮助信息  &nbsp; &nbsp;                                     [布尔]

  -v, --version &nbsp; &nbsp;      显示版本号 &nbsp; &nbsp;                                         [布尔]

##使用示例：
* 将当前分支的改动推送到远程的t分支(t分支是默认值时可以省略不写)然后又切回当前分支,提交信息为addThings  
  *`ssgit addThings`*
* 将当前分支的改动推送到远程的的t分支然后又切回当前分支,同时需要在t分支上执行打包操作,提交信息为addThings,打包使用的脚本命令时npm run build  
  *`ssgit addThings -b`*
* 将当前分支的改动推送到远程的t分支然后又切回当前分支,执行该操作过程中,在t上进行merge操作时,有冲突被中断,解决完冲突后,想继续之前的操作  
  *`ssgit addThings -c`*
* 将当前分支的改动推送到远程的test分支然后又切回当前分支,提交信息为addThings  
  *`ssgit -t=test addThings`*
* 修改默认分支为dev  
  *`ssgit --tdefalut=dev`*
* 默认在目标分支进行打包操作  
  *`ssgit --bdefalut=true`*  
* 获取默认配置的值  
  *`ssgit -d`*
* 只简单地提交本地改动到远程,不涉及分支的切换以及合并 ,提交信息为addThings  
  *`ssgit addThings -l`*
