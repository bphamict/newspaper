const schedule = require('node-schedule');
const postModel = require('../models/post.model');
const debug = require('debug')('app:schedule');

const j = schedule.scheduleJob('*/60 * * * * *', async () => {
  debug('execute scripts schedule');
  await postModel.findAndPublishPost();
});
