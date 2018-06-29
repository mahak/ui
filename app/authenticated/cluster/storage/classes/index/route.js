import { get, set } from '@ember/object'
import { hash } from 'rsvp';
import Route from '@ember/routing/route';
import { on } from '@ember/object/evented';
import C from 'ui/utils/constants';

export default Route.extend({
  setDefaultRoute: on('activate', function() {

    set(this, `session.${ C.SESSION.CLUSTER_ROUTE }`, 'authenticated.cluster.storage.classes');

  }),
  model() {

    let cluster = this.modelFor('authenticated.cluster');

    if ( !get(cluster, 'isReady') ) {

      this.transitionTo('authenticated.cluster.index');

    }

    return hash({ storageClasses: get(this, 'clusterStore').findAll('storageClass'), });

  },

});
