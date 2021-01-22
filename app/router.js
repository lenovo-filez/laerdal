'use strict';

module.exports = app => {
  const { router, controller } = app;
  router.post('/send/:groupkey', controller.home.index);
  router.post('/jira/send/:groupkey', controller.jiraSend.sendMessage);
  router.get('/job/list', controller.scheduleOperation.querySchedule);
  router.get('/job/add', controller.scheduleOperation.addSchedule);
  router.get('/job/update', controller.scheduleOperation.updateSchedule);
  router.get('/job/delete', controller.scheduleOperation.deleteSchedule);
  router.get('/job/detail', controller.scheduleOperation.detailSchedule);
  router.get('/job/restart', controller.scheduleOperation.restartSchedule);
  router.get('/job/stop', controller.scheduleOperation.stopSchedule);
  router.get('/job/view/list', controller.scheduleOperation.viewList);
  router.get('/job/view/add', controller.scheduleOperation.viewAdd);
  router.get('/job/view/:jobId/edit', controller.scheduleOperation.viewEdit);
};
