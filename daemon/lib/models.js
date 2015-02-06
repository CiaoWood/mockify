'use strict';

module.exports = (function () {
  return {
    /**
     * Record model
     */
    Record: function (db) {
      /* jscs:disable disallowSpaceAfterObjectKeys */
      return db.define('Record', {
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
        delay       : Number,
        targetId    : Number
      }, {
        cache       : false,
        methods     : {
          // fullName: function () {
          //   return this.name + ' ' + this.surname;
          // }
        }
        // validations: {
        //   age: orm.enforce.ranges.number(18, undefined, 'under-age')
        // }
      });
      /* jscs:enable disallowSpaceAfterObjectKeys */
    },

    /**
     * Target model
     */
    Target: function (db) {
      /* jscs:disable disallowSpaceAfterObjectKeys */
      return db.define('target', {
        port        : Number,
        url         : String,
        recording   : Number
      }, {
        cache       : false,
        methods     : {
          // fullName: function () {
          //   return this.name + ' ' + this.surname;
          // }
        }
        // validations: {
        //   age: orm.enforce.ranges.number(18, undefined, 'under-age')
        // }
      });
      /* jscs:enable disallowSpaceAfterObjectKeys */
    }
  };
})();
