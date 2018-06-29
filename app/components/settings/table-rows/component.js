import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import C from 'ui/utils/constants';
import layout from './template';

const TABLE_COUNTS = [
  { value: '10', },
  { value: '25', },
  { value: '50', },
  { value: '100', },
  { value: '250', },
  { value: '500', },
  { value: '1000', },
];

export default Component.extend({
  prefs:         service(),
  layout,
  tableCounts:   TABLE_COUNTS,
  selectedCount: null,

  perPage:       alias('prefs.tablePerPage'),
  init() {

    this._super(...arguments);
    this.set('selectedCount', `${ this.get('perPage') }`);

  },

  actions: {
    save(cb) {

      this.set(`prefs.${ C.PREFS.TABLE_COUNT }`, parseInt(this.get('selectedCount'), 10));
      cb(true);
      this.sendAction('done');

    }
  }
});
