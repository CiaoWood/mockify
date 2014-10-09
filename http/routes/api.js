module.exports = (function () {
  'use strict';

  var apiRouter = require('express').Router();

  function notImplementedYet(res) {
    res.json({ message: 'Not implemented yet' });
  }

  function index(req, res) {
    res.json({
      message: 'Welcome to the mockify api!\nAPI is reachable.'
    });
  }

  /**
   * @FIXME
   */
  function listTargets(req, res) {
    notImplementedYet(res);
  }

  /**
   * @FIXME
   */
  function getTarget(req, res) {
    notImplementedYet(res);
  }

  /**
   * @FIXME
   */
  function createTarget(req, res) {
    notImplementedYet(res);
  }

  /**
   * @FIXME
   */
  function updateTarget(req, res) {
    notImplementedYet(res);
  }

  /**
   * @FIXME
   */
  function removeTarget(req, res) {
    notImplementedYet(res);
  }

  apiRouter.route('/').get(index);

  apiRouter.route('/targets')
    .get(listTargets)
    .post(createTarget);

  apiRouter.route('/targets/:id')
    .get(getTarget)
    .put(updateTarget)
    .delete(removeTarget);

  return apiRouter;
})();
