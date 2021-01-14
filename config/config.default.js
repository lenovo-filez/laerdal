'use strict';

exports.security = {
  csrf: {
    enable: false,
  },
};

exports.view = {
  defaultViewEngine: 'xtpl',
  mapping: {
    '.xtpl': 'xtpl',
  },
};
