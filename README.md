# 向企业微信群组推送消息
## gitlab推送企业微信群组机器人
> 支持gitlab所有触发动作

### 推送显示示例如下
#### 分支相关操作
![分支相关操作](static/images/branch.png "分支相关操作")

#### tag相关操作
![tag相关操作](static/images/tag.png "tag相关操作")

#### 评论操作
- 评论 commit

![评论 commit](static/images/comment-commit.png "评论 commit")
- 评论 Merge Request

![评论 Merge Request](static/images/comment-mr.png "评论 Merge Request")
- 评论 issue

![评论 issue](static/images/comment-issue.png "评论 issue")

#### issue相关操作
![issue相关操作](static/images/issue.png "issue相关操作")

#### Merge Request 相关操作
![Merge Request 相关操作](static/images/mr.png "Merge Request 相关操作")

#### Pipeline 相关操作
![Pipeline 相关操作](static/images/pipeline.png "Pipeline 相关操作")
#### wiki 相关操作
![wiki 相关操作](static/images/wiki.png "wiki 相关操作")

### 微信群组添加机器人
> 参考[群机器人配置说明](https://work.weixin.qq.com/api/doc/90000/90136/91770)


### gitlab设置webhooks
1. 进入项目 设置 => 集成
2. url填写自己服务部署的地址，以服务部署地址为 `http://100.10.10.100:7001` 为例
```
// 微信群组机器人的webhookUrl
https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=ajs2w1o3102ndas9u121aw1u20
 
// gitlab集成设置的url，api调用路径最后使用微信群组的key即可
http://100.10.10.100:7001/send/ajs2w1o3102ndas9u121aw1u20
```
3. 选择需要触发推送的操作保存设置即可
![gitlab设置](static/images/gitlab.png "gitlab设置")


## 定时向微信群组推送消息
> 目前只支持文本类型，服务启动会默认开启所有设置为开启状态的定时任务。

### 微信群组添加机器人
> 参考[群机器人配置说明](https://work.weixin.qq.com/api/doc/90000/90136/91770) 使用所添加机器人的webhook_url作为定时任务配置的url

### web页面配置定时任务
#### 查看所有定时任务情况以及开启状态  /job/view/list
![查看所有定时任务配置](static/images/list.png "查看所有定时任务配置")
#### 添加定时任务  /job/view/add
![添加定时任务](static/images/operation.png "添加定时任务")

### 接口形式调用
> get 请求

#### 查看所有定时任务情况  /job/list

**返回值**
```
{ "data": [
    { 
       "url": "推送地址webhook",
       "content": "推送内容",
       "cron": "40 * * * * *",
       "options": "",
       "id": 1,
       "isStarting": 1
    }
  ]
}
```
**返回值说明**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| url | string | 微信群组Webhook_url |
| content | string | 推送消息 |
| cron | string | 定时发送规则(Cron风格) |
| options | string | 定时发送判断条件(isSendDaily: 工作日发送消息，考虑节假日调休情况; isSendWeekly: 每周最后一个工作日发送消息，节假日调休情况) |
| isStarting | number | 任务是否在运行中(0: 定时任务没有运行; 1: 定时任务运行中) |

#### 添加定时任务  /job/add?url=xxx&content=xxx&cron=xxx&options=xxx
> 默认新添的定时任务会自动启动

**接口入参**

| 参数 | 类型 | 是否必选 | 说明 |
| --- | --- | --- | --- |
| url | string | true | 微信群组Webhook_url |
| content | string | true | 推送消息 |
| cron | string | true | 定时发送规则(Cron风格) |
| options | string | false | 定时发送判断条件(isSendDaily: 工作日发送消息，考虑节假日调休情况; isSendWeekly: 每周最后一个工作日发送消息，节假日调休情况) |

**返回值**
```
{ "data": true }
```
**返回值说明**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| data | boolean | 是否添加成功 |

#### 更新定时任务  /job/update?url=xxx&content=xxx&cron=xxx&id=xxx&options=xxx
> 默认更新后的定时任务会处于启动状态

**接口入参**

| 参数 | 类型 | 是否必选 | 说明 |
| --- | --- | --- | --- |
| url | string | true | 微信群组Webhook_url |
| content | string | true | 推送消息 |
| cron | string | true | 定时发送规则(Cron风格) |
| id | number | true | 所要更新任务的id |
| options | string | false | 定时发送判断条件(isSendDaily: 工作日发送消息，考虑节假日调休情况; isSendWeekly: 每周最后一个工作日发送消息，节假日调休情况) |

**返回值**
```
{ "data": true }
```
**返回值说明**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| data | boolean | 是否更新成功 |

#### 删除定时任务 /job/delete?jobId=xxx
> 删除此定时任务的配置信息，并停止该定时任务的运行

**接口入参**

| 参数 | 类型 | 是否必选 | 说明 |
| --- | --- | --- | --- |
| jobId | number | true | 所要删除任务的id |


**返回值**
```
{ "data": true }
```
**返回值说明**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| data | boolean | 是否删除成功 |

#### 查询定时任务详情 /job/detail?jobId=xxx

**接口入参**

| 参数 | 类型 | 是否必选 | 说明 |
| --- | --- | --- | --- |
| jobId | number | true | 所要查询详情的任务id |


**返回值**
```
{ "data": { 
    "url": "推送地址webhook",
    "content": "推送内容",
    "cron": "40 * * * * *",
    "options": "",
    "id": 1,
    "isStarting": 1
  }
}
```
**返回值说明**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| url | string | 微信群组Webhook_url |
| content | string | 推送消息 |
| cron | string | 定时发送规则(Cron风格) |
| options | string | 定时发送判断条件(isSendDaily: 工作日发送消息，考虑节假日调休情况; isSendWeekly: 每周最后一个工作日发送消息，节假日调休情况) |
| isStarting | number | 任务是否在运行中(0: 定时任务没有运行; 1: 定时任务运行中) |

#### 停止定时任务 /job/stop?jobId=xxx
> 停止定时任务，不会删除配置还可以重启此定时任务

**接口入参**

| 参数 | 类型 | 是否必选 | 说明 |
| --- | --- | --- | --- |
| jobId | number | true | 所要停止的任务id |


**返回值**
```
{ "data": true }
```
**返回值说明**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| data | boolean | 是否停止成功 |

#### 重启定时任务 /job/restart?jobId=xxx

**接口入参**

| 参数 | 类型 | 是否必选 | 说明 |
| --- | --- | --- | --- |
| jobId | number | true | 所要重启的任务id |


**返回值**
```
{ "data": true }
```
**返回值说明**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| data | boolean | 是否重启成功 |


## 使用docker部署项目
> docker-compose up --build -d

通过:7001端口访问服务即可





