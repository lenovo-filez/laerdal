'use strict';

module.exports = app => {
  const { router, controller } = app;
  router.post('/send/:groupkey', controller.home.index);
};
