'use strict';

const Service = require('egg').Service;
const S = require('string');

const OBJECT_KIND = {
  push: 'push',
  tag_push: 'tagPush',
  issue: 'issue',
  note: 'note',
  merge_request: 'mergeRequest',
  wiki_page: 'wikiPage',
  pipeline: 'pipeline',
  build: 'build',
};

class WebhookService extends Service {
  // gitlab不同操作的的调用不同的信息处理方法
  async translateMsg(data) {
    const { object_kind } = data || {};
    // 根据操作类型对应指定的方法
    const matchFunc = OBJECT_KIND[object_kind];
    if (!matchFunc) {
      return false;
    }
    const res = await this[matchFunc](data);
    if (!res) return false;
    return {
      msgtype: 'markdown',
      markdown: { content: res.join(' \n  ') },
    };
  }

  // 除tag以外的push操作信息处理
  async push({ ref, user_name, project, before, after }) {
    const { name: projName, web_url } = project || {};
    const branch = ref.replace('refs/heads/', '');
    let op = '';
    if (before === '0000000000000000000000000000000000000000') {
      op = 'add';
    } else if (after === '0000000000000000000000000000000000000000') {
      op = 'delete';
    } else {
      op = 'update';
    }
    const content = [];
    const branchDisplay = op === 'delete' ? branch : `[${branch}](${web_url}/tree/${branch})`;
    content.push(`${user_name} ${op} branch ${branchDisplay}`);
    content.push(`> Repository：${projName}`);
    return content;
  }

  // tag的操作信息处理
  async tagPush({ ref, user_name, project, before, after }) {
    const { name: projName, web_url } = project || {};
    const tag = ref.replace('refs/tags/', '');
    let op = '';
    if (before === '0000000000000000000000000000000000000000') {
      op = 'add';
    } else if (after === '0000000000000000000000000000000000000000') {
      op = 'delete';
    }
    const content = [];
    const tagDisplay = op === 'add' ? `[${tag}](${web_url}/-/tags/${tag})` : tag;
    content.push(`${user_name} ${op} tag ${tagDisplay}`);
    content.push(`> Repository：${projName}`);
    return content;
  }

  // issue的操作信息处理
  async issue({ user, project, object_attributes }) {
    const { name } = user || {};
    const { url, state, action, title } = object_attributes || {};
    const { name: projName } = project || {};
    const content = [];
    content.push(`${name} ${action} the issue`);
    content.push(`> [${S(title).collapseWhitespace()}](${url})`);
    content.push(`> Status：${state}`);
    content.push(`> Repository：${projName}`);
    return content;
  }

  // 评论的操作信息处理
  async note(data) {
    const { object_attributes: { noteable_type } } = data || {};
    const noteFuncMap = {
      MergeRequest: 'noteMr',
      Commit: 'noteCommit',
      Issue: 'noteIssue',
      Snippet: 'noteSnippet',
    };
    // 不同的评论操作调用不同的评论方法
    const matchFunc = noteFuncMap[noteable_type];
    if (!matchFunc) {
      return false;
    }
    return await this[matchFunc](data);
  }

  // 评论commit的操作信息处理
  async noteCommit({ user, object_attributes, commit }) {
    const { name } = user || {};
    const { url, note } = object_attributes || {};
    const { message } = commit || {};
    const content = [];
    content.push(`${name} [commented](${url}) on commit ${message}`);
    content.push(`> ${note}`);
    return content;
  }

  // 评论merge request的操作信息处理
  async noteMr({ user, object_attributes, merge_request }) {
    const { name } = user || {};
    const { url, note } = object_attributes || {};
    const { target_branch, source_branch } = merge_request || {};
    const content = [];
    content.push(`${name} [commented](${url}) on merge request from branch ${source_branch} to ${target_branch}`);
    content.push(`> ${note}`);
    return content;
  }

  // 评论issue的操作信息处理
  async noteIssue({ user, object_attributes, issue }) {
    const { name } = user || {};
    const { url, note } = object_attributes || {};
    const { title } = issue || {};
    const content = [];
    content.push(`${name} [commented](${url}) on issue ${title}`);
    content.push(`> ${note}`);
    return content;
  }

  // 评论code snippet的操作信息处理
  async noteSnippet({ user, object_attributes }) {
    const { name } = user || {};
    const { url, note } = object_attributes || {};
    const content = [];
    content.push(`${name} [commented](${url}) on code snippet`);
    content.push(`> ${note}`);
    return content;
  }

  // mereg request的操作信息处理
  async mergeRequest({ user, project, object_attributes }) {
    const { name } = user || {};
    const { url, target_branch, source_branch, state, action, title } = object_attributes || {};
    const { name: projName } = project || {};
    const content = [];
    content.push(`${name} ${action} the merge request from branch ${source_branch} to ${target_branch}`);
    content.push(`> [${S(title).collapseWhitespace()}](${url})`);
    content.push(`> Status：${state}`);
    content.push(`> Repository：${projName}`);
    return content;
  }

  // wiki的操作信息处理
  async wikiPage({ user, project, object_attributes }) {
    const { name } = user || {};
    const { url, title, action } = object_attributes || {};
    const { name: projName } = project || {};
    const content = [];
    const wikiDisplay = action === 'delete' ? title : `[${title}](${url})`;
    content.push(`${name} ${action} wiki ${wikiDisplay}`);
    content.push(`> Repository：${projName}`);
    return content;
  }

  // Pipeline events的操作信息处理
  async pipeline({ user, project, object_attributes }) {
    const { name } = user || {};
    const { id, status } = object_attributes || {};
    const { name: projName, web_url } = project || {};
    const pipelineUrl = `${web_url}/pipelines/${id}`;
    const content = [];
    content.push(`${name} trigger [pipeline](${pipelineUrl})`);
    content.push(`> Status：${status}`);
    content.push(`> Repository：${projName}`);
    return content;
  }

  // Job events的操作信息处理
  async build({ user, build_id, build_status, repository }) {
    const { name } = user || {};
    const { homepage: web_url, name: projName } = repository || {};
    const buildUrl = `${web_url}/-/jobs/${build_id}`;
    const content = [];
    content.push(`${name} trigger [job](${buildUrl})`);
    content.push(`> Status：${build_status}`);
    content.push(`> Repository：${projName}`);
    return content;
  }
}

module.exports = WebhookService;
