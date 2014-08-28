'use strict';

module.exports = {
  /**
   * Response model
   */
  Response: function (db) {
    return db.define('response', {
      uuid        : String,
      dateCreated : Date,
      status      : Number,
      url         : String,
      method      : String,
      parameters  : Object,
      reqHeaders  : Object,
      resHeaders  : Object,
      body        : Object,
      comment     : String,
      apiId       : Number
    }, {
      methods: {
        // fullName: function () {
        //   return this.name + ' ' + this.surname;
        // }
      }
      // validations: {
      //   age: orm.enforce.ranges.number(18, undefined, 'under-age')
      // }
    });
  },

  /**
   * Proxy model
   */
  Proxy: function (db) {
    return db.define('proxy', {
      port        : Number,
      target      : String,
      status      : ['active', 'inactive']
    }, {
      methods: {
        // fullName: function () {
        //   return this.name + ' ' + this.surname;
        // }
      }
      // validations: {
      //   age: orm.enforce.ranges.number(18, undefined, 'under-age')
      // }
    });
  }
};
