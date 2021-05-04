const _ = require('lodash');
const qs = require('query-string');
const config = require('../shared/config');


module.exports = {
  /**
   * Helper method for mongoose schemas for returning API compatible serializations. It mainly
   * maps _id to id and ensures the version key is not returned.
   */
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => {
      delete ret._id;
    },
  },

  /**
   * Returns a standardized API error for serialization.
   * @param description General description of the error, if applicable.
   * @param error Joi validation error to parse into fields.
   * @returns {{description: *, fields: *}}
   */
  APIError: ({ description, error, fields }) => {
    const result = { description };

    if (fields) {
      result.fields = { ...fields };
    }

    if (!error || !error.details) return result;

    result.fields = result.fields || {};

    for (const item of error.details) {
      const messages = result.fields[item.context.label] || []

      messages.push(_.capitalize(_.trimStart(item.message, `"${item.context.label}" `)));
      result.fields[item.context.label] = messages;
    }

    return result;
  },

  APINotFoundError: () => module.exports.APIError({ description: "Not found" }),

  serialize: obj => obj.toJSON(),

  absoluteURL: (req, path, query) => {
    const port = [80, 443].includes(config.port) ? '' : `:${config.port}`;
    let url = `${req.protocol}://${req.hostname}${port}${path || ''}`;

    return query ? url + qs.stringify(query) : url;
  },
}
