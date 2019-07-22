import Resource from '@rancher/ember-api-store/models/resource';
import { reference } from '@rancher/ember-api-store/utils/denormalize';
import { inject as service } from '@ember/service';
import { computed, set, get } from '@ember/object';
import { not, alias } from '@ember/object/computed';

export default Resource.extend({
  globalStore: service(),
  router:      service(),
  growl:       service(),
  intl:        service(),

  type:            'clustertemplaterevision',

  clusterTemplate:  reference('clusterTemplateId', 'clusterTemplate', 'globalStore'),
  canCloneRevision: not('clusterTemplate.isReadOnly'),
  canRemove:        alias('canMakeDefault'),

  canBulkRemove: computed('clusterTemplateId', function() {
    let { clusterTemplate } = this;

    if (clusterTemplate &&
        clusterTemplate.defaultRevisionId &&
        clusterTemplate.defaultRevisionId !== this.id &&
        get(this, 'clusterTemplate.isReadOnly')) {
      return true;
    }

    return false;
  }),

  canMakeDefault: computed('clusterTemplate.defaultRevisionId', 'clusterTemplate.isReadOnly', function() {
    let { clusterTemplate: { defaultRevisionId = '' } } = this;

    return this.id !== defaultRevisionId && !get(this, 'clusterTemplate.isReadOnly');
  }),

  availableActions: computed('actionLinks.[]', 'enabled', 'clusterTemplate.defaultRevisionId', function() {
    return [
      {
        label:     'generic.enable',
        icon:      'icon icon-play',
        action:    'enable',
        enabled:   !this.enabled && !get(this, 'clusterTemplate.isReadOnly'),
      },
      {
        label:     'generic.disable',
        icon:      'icon icon-stop',
        action:    'disable',
        enabled:   this.enabled && !get(this, 'clusterTemplate.isReadOnly'),
      },
      {
        label:     'action.makeDefault',
        icon:      'icon icon-success',
        action:    'setDefault',
        enabled:   this.canMakeDefault,
      },
      {
        label:     'action.cloneRevision',
        icon:      'icon icon-copy',
        action:    'newRevision',
        enabled:   this.canCloneRevision,
      },
    ];
  }),

  actions: {
    newRevision() {
      this.router.transitionTo('global-admin.cluster-templates.new-revision', this.clusterTemplateId, { queryParams: { revision: this.id } });
    },

    setDefault() {
      const { clusterTemplate } = this;
      const successTitle   = this.intl.t('action.setDefaultRevision.success.title');
      const successMessage = this.intl.t('action.setDefaultRevision.success.message', {
        name:   this.displayName,
        ctName: this.clusterTemplate.displayName,
      });

      set(clusterTemplate, 'defaultRevisionId', this.id);

      clusterTemplate.save()
        .then(() => this.growl.success(successTitle, successMessage))
        .catch((err) => this.growl.fromError(err));
    },

    disable() {
      set(this, 'enabled', false);

      this.save()
        .catch((err) => this.growl.fromError(err));
    },

    enable() {
      set(this, 'enabled', true);

      this.save()
        .catch((err) => this.growl.fromError(err));
    },
  },

  validationErrors() {
    let errors = [];

    if (errors.length > 0) {
      return errors;
    }

    errors = this._super(...arguments);

    return errors;
  },
});