module.exports = {


  friendlyName: 'Replace collection',


  description: 'Replace the associated collection of this record with the specified IDs.',


  habitat: 'sails',


  inputs: {

    model: {
      friendlyName: 'Model',
      extendedDescription: 'The specified string should be the _identity_ of the model.',
      example: 'user',
      required: true
    },

    recordId: {
      description: 'The ID of this record.',
      extendedDescription: 'Must be a number or string; e.g. `\'507f191e810c19729de860ea\'`',
      example: '*',
      required: true
    },

    association: {
      description: 'The name of the association.',
      example: 'locations',
      required: true
    },

    associatedIds: {
      description: 'The IDs to replace this record\'s associated collection with.',
      extendedDescription: 'Must be an array of numbers or strings; e.g. `[\'507f191e810c19729de860ea\']`',
      example: ['*'],
      required: true
    },

    connection: {
      description: 'An existing connection to use (otherwise, by default, a new connection is acquired from the datastore).',
      example: '==='
    },

    meta: {
      description: 'Additional adapter-specific metadata to pass to Waterline.',
      example: '==='
    }

  },


  exits: {

    success: {
      description: 'Done.'
    },

    recordNotFound: {
      description: 'The primary record (i.e. with the specified `recordId`) could not be found.'
    }

  },


  fn: function(inputs, exits) {
    var util = require('util');

    if (!util.isObject(env.sails.hooks.orm)) {
      return exits.error(new Error('`sails.hooks.orm` cannot be accessed; please ensure this machine is being run in a compatible habitat.'));
    }

    // Check to ensure `inputs.model` is a recognized model.
    var Model = env.sails.hooks.orm.models[inputs.model];
    if (!util.isObject(Model)) {
      return exits.error(new Error('Unrecognized model (`'+inputs.model+'`).  Please check your `api/models/` folder and check that a model with this identity exists.'));
    }
    // Check to ensure `inputs.association` is a recognized collection association
    if (!util.isObject(Model.attributes[inputs.association])) {
      return exits.error(new Error('Unrecognized association (`'+inputs.association+'`).  Please check that a "collection" association named `'+inputs.association+'` is defined as an attribute of this model (`'+inputs.model+'`).'));
    }
    else if (!Model.attributes[inputs.association].collection) {
      return exits.error(new Error('Invalid association (`'+inputs.association+'`).  This method is only compatible with "collection" associations.'));
    }

    // Start building query
    var q = Model.replaceCollection(inputs.recordId, inputs.association, inputs.associatedIds);

    // Use metadata if provided.
    if (!util.isUndefined(inputs.meta)) {
      q = q.meta(inputs.meta);
    }

    // Use existing connection if one was provided.
    if (!util.isUndefined(inputs.connection)) {
      q = q.usingConnection(inputs.connection);
    }

    // Execute query
    q.exec(function afterwards(err) {
      if (err) {
        // TODO: negotiate error in order to trigger `exits.recordNotFound()`
        return exits.error(err);
      }
      return exits.success();
    });
  }


};
