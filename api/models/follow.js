'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FollowSchema = Schema({
	user: { type: Schema.objectId, ref: 'User'},
	followed: { type: Schema.objectId, ref: 'User'}
})

module.exports = mongoose.model('Follow', FollowSchema)