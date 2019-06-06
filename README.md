
## usage
Usage: ssgit [options]

选项：
  --version   &nbsp; &nbsp;       显示版本号  &nbsp; &nbsp;[布尔]

  --target, -t    &nbsp; &nbsp;       target branch &nbsp; &nbsp;   [字符串] [必需] [默认值: "t"]
  
  --source, -s    &nbsp; &nbsp;       source branch  &nbsp; &nbsp;  [字符串] [必需]

  --commitAndMerge, -m  &nbsp; &nbsp;    message about commit&merge  &nbsp; &nbsp;   [字符串] [必需]

  --conflict, -c    &nbsp; &nbsp;     Whether conflicts have been resolved  &nbsp; &nbsp; [字符串] [必需] [默认值: false]

  --build, -b    &nbsp; &nbsp;        Whether to pack locally  &nbsp; &nbsp; [字符串] [必需] [默认值: false]

  -h, --help     &nbsp; &nbsp;        显示帮助信息  &nbsp; &nbsp;  [布尔]

示例：
  ssgit -t=t -s=feature/search -m='commit'

缺少这些必须的选项：  source, commitAndMerge


