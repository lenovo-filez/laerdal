'use strict';

const Service = require('egg').Service;
const _ = require('lodash');

class JiraSendService extends Service {
  // jira不同操作的调用不同的信息处理方法
  async translateMsg(data) {
    const { webhookEvent, issue_event_type_name } = data || {};
    if (webhookEvent) {
      let res = '';
      if (webhookEvent.startsWith('jira:issue')) {
        if (issue_event_type_name === 'issue_commented') {
          // issue添加评论事件
          res = await this.issueComment(data);
        } else if (issue_event_type_name === 'issue_comment_edited') {
          // issue编辑评论事件
          res = await this.issueEditComment(data);
        } else if (issue_event_type_name === 'issue_comment_deleted') {
          // issue删除评论事件
          res = await this.issueDeleteComment(data);
        } else {
          // issue相关事件且不是评论事件
          res = await this.issue(data);
        }
      } else if (webhookEvent.startsWith('jira:worklog')) {
        // 工作日志更改和issue更新使用相同通知
        data.webhookEvent = 'jira:issue_updated';
        res = await this.issue(data);
      } else if (webhookEvent.startsWith('jira:version')) {
        // version相关事件
        res = await this.version(data);
      } else if (webhookEvent.startsWith('project')) {
        // project相关事件
        res = await this.project(data);
      } else if (webhookEvent.startsWith('user')) {
        // user相关事件
        res = await this.user(data);
      } else if (webhookEvent.startsWith('sprint')) {
        // sprint相关事件
        res = await this.sprint(data);
      } else if (webhookEvent.startsWith('board')) {
        // board相关事件
        res = await this.board(data);
      }
      if (!res) return false;
      return {
        msgtype: 'markdown',
        markdown: { content: res.join(' \n  ') },
      };
    }
    return false;
  }

  // issue相关操作信息处理
  async issue({ webhookEvent, user, issue }) {
    const operationMap = {
      created: 'create',
      updated: 'update',
      deleted: 'delete',
    };
    let operationDisplay = webhookEvent.replace(/jira:issue_/, '');
    operationDisplay = operationMap[operationDisplay];
    const { displayName } = user || {};
    const {
      self,
      key,
      fields: {
        summary,
        issuetype: { name: issuetypeName },
        status: { name },
        assignee: { displayName: assigneeDisplayName },
        reporter: { displayName: reporterDisplayName },
        project: { name: projectName },
      },
    } = issue || {};
    const baseJiraUrl = (self || '').replace(/\/rest\/.*$/, '');
    const displaySummary = operationDisplay === 'delete' ? `${key}/${summary}` : `[${key}/${summary}](${baseJiraUrl}/browse/${key})`;
    const content = [];
    content.push(`${displayName} ${operationDisplay} ${issuetypeName} ${displaySummary}`);
    projectName && content.push(`> Project：${projectName}`);
    name && content.push(`> Status：${name}`);
    assigneeDisplayName && content.push(`> Assignee：${assigneeDisplayName}`);
    reporterDisplayName && content.push(`> Reporter：${reporterDisplayName}`);
    return content;
  }

  // issue添加评论操作信息处理
  async issueComment({ user, issue, comment }) {
    const { displayName } = user || {};
    const {
      self,
      key,
      fields: { summary },
    } = issue || {};
    const { body, id } = comment || {};
    const baseJiraUrl = (self || '').replace(/\/rest\/.*$/, '');
    const commentUrl = `${baseJiraUrl}/browse/${key}?focusedCommentId=${id}&page=com.atlassian.jira.plugin.system.issuetabpanels:comment-tabpanel#comment-${id}`;
    const content = [];
    content.push(`${displayName} [commented](${commentUrl}) on ${key}/${summary}`);
    body && content.push(`> ${body}`);
    return content;
  }

  // issue编辑评论操作信息处理
  async issueEditComment({ user, issue, comment }) {
    const { displayName } = user || {};
    const {
      self,
      key,
      fields: { summary },
    } = issue || {};
    const { body, id } = comment || {};
    const baseJiraUrl = (self || '').replace(/\/rest\/.*$/, '');
    const commentUrl = `${baseJiraUrl}/browse/${key}?focusedCommentId=${id}&page=com.atlassian.jira.plugin.system.issuetabpanels:comment-tabpanel#comment-${id}`;
    const content = [];
    content.push(`${displayName} edit [comment](${commentUrl}) on ${key}/${summary}`);
    body && content.push(`> ${body}`);
    return content;
  }

  // issue删除评论操作信息处理
  async issueDeleteComment({ user, issue }) {
    const { displayName } = user || {};
    const {
      self,
      key,
      fields: { summary },
    } = issue || {};
    const baseJiraUrl = (self || '').replace(/\/rest\/.*$/, '');
    const issueUrl = `${baseJiraUrl}/browse/${key}`;
    const content = [];
    content.push(`${displayName} delete comment on [${key}/${summary}](${issueUrl})`);
    return content;
  }

  // version相关操作信息处理
  async version({ webhookEvent, version }) {
    const { name, description, userReleaseDate } = version || {};
    const operationDisplay = webhookEvent.replace(/jira:version_/, '');
    const content = [];
    content.push(`${name} version has been ${operationDisplay}`);
    description && content.push(`> Description：${description}`);
    userReleaseDate && content.push(`> ReleaseDate：${userReleaseDate}`);
    return content;
  }

  // project相关操作信息处理
  async project({ webhookEvent, project }) {
    const operationDisplay = webhookEvent.replace(/project_/, '');
    const { self, key, name, projectLead: { displayName } } = project || {};
    const baseJiraUrl = (self || '').replace(/\/rest\/.*$/, '');
    const projectUrl = `${baseJiraUrl}/projects/${key}/summary`;
    const projectDisplay = operationDisplay === 'deleted' ? name : `[${name}](${projectUrl})`;
    const content = [];
    content.push(`${projectDisplay} project has been ${operationDisplay}`);
    displayName && content.push(`> Leader：${displayName}`);
    return content;
  }

  // user相关操作信息处理
  async user({ webhookEvent, user }) {
    const operationDisplay = webhookEvent.replace(/user_/, '');
    const { name, displayName } = user || {};
    const content = [];
    content.push(`user ${displayName ? displayName : name} has been ${operationDisplay}`);
    return content;
  }

  // sprint相关操作信息处理
  async sprint({ webhookEvent, sprint }) {
    const { self, name, state, originBoardId } = sprint || {};
    const operationDisplay = webhookEvent.replace(/sprint_/, '');
    const baseJiraUrl = (self || '').replace(/\/rest\/.*$/, '');
    const sprintUrl = `${baseJiraUrl}/secure/RapidBoard.jspa?rapidView=${originBoardId}`;
    const sprintDisplay = operationDisplay === 'deleted' ? name : `[${name}](${sprintUrl})`;
    const content = [];
    content.push(`${sprintDisplay} sprint has been ${operationDisplay}`);
    state && content.push(`> Status：${state}`);
    return content;
  }

  // board相关操作信息处理
  async board(data) {
    const { webhookEvent } = data;
    const operationDisplay = webhookEvent.replace(/board_/, '');
    let self = '';
    let id = '';
    let name = '';
    if (operationDisplay === 'configuration_changed') {
      self = _.get(data, 'configuration.self');
      id = _.get(data, 'configuration.id');
      name = _.get(data, 'configuration.name');
    } else {
      self = _.get(data, 'board.self');
      id = _.get(data, 'board.id');
      name = _.get(data, 'board.name');
    }
    const baseJiraUrl = (self || '').replace(/\/rest\/.*$/, '');
    const boardUrl = `${baseJiraUrl}/secure/RapidBoard.jspa?rapidView=${id}&view=planning.nodetail`;
    const boardDisplay = operationDisplay === 'deleted' ? name : `[${name}](${boardUrl})`;
    const content = [];
    if (operationDisplay === 'configuration_changed') {
      content.push(`${boardDisplay} board configuration has been changed`);
    } else {
      content.push(`${boardDisplay} board has been ${operationDisplay}`);
    }
    return content;
  }
}

module.exports = JiraSendService;
