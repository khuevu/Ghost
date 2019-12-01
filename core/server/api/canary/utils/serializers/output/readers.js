const debug = require('ghost-ignition').debug('api:canary:utils:serializers:output:readers');
const common = require('../../../../../lib/common');
const mapper = require('./utils/mapper');

module.exports = {
    add(model, apiConfig, frame){
        debug('add');
        frame.response = {
            message: 'Added'
        };
    },

    purchase(model, apiConfig, frame) {
        debug('purchase');
        frame.response = {
            message: 'Purchased'
        };
    },

    listpurchases(models, apiConfig, frame) {
        debug('listpurchases');

        if (!models) {
            return;
        }

        if (models.meta) {
            frame.response = {
                posts: models.data.map(model => mapper.mapPost(model, frame)),
                meta: models.meta
            };

            debug(frame.response);
            return;
        }

        frame.response = {
            posts: mapper.mapPost(models, frame)
        };

        debug(frame.response);
    }
};
