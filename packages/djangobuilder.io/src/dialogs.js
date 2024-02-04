import Vue from 'vue'
import vuetify from '@/plugins/vuetify'
import MessageDialog from '@/components/MessageDialog.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import UpgradeDialog from '@/components/UpgradeDialog.vue'
import DeleteDialog from '@/components/DeleteDialog.vue'
import FormDialog from '@/components/FormDialog.vue'

const showMessageDialog = function (headline, text, ok) {
  var MessageDialogClass = Vue.extend(MessageDialog)
  var dialog = new MessageDialogClass({
    vuetify, propsData: { headline: headline, text: text, ok: ok }
  })
  dialog.$mount()
}

const showConfirmDialog = function (headline, text, ok, cancel = () => {}, options) {
  var ConfirmDialogClass = Vue.extend(ConfirmDialog)
  var dialog = new ConfirmDialogClass({
    vuetify, propsData: { headline: headline, text: text, ok: ok, cancel: cancel, options: options }
  })
  dialog.$mount()
}

const showUpgradeDialog = function (upgrade, ok, cancel = () => {}) {
  var UpgradeDialogClass = Vue.extend(UpgradeDialog)
  var dialog = new UpgradeDialogClass({
    vuetify, propsData: { upgrade: upgrade, ok: ok, cancel: cancel }
  })
  dialog.$mount()
}

const showDeleteDialog = function (text, ok, cancel = () => {}) {
  var DeleteDialogClass = Vue.extend(DeleteDialog)
  var dialog = new DeleteDialogClass({
    vuetify, propsData: { text: text, ok: ok, cancel: cancel }
  })
  dialog.$mount()
}

const showFormDialog = function (headline, ok, schema, formdata, extra, okText) {
  var FormDialogClass = Vue.extend(FormDialog)
  var dialog = new FormDialogClass({
    vuetify,
    propsData: {
      headline: headline,
      ok: ok,
      schema: schema,
      formdata: formdata || {},
      extra: extra,
      okText: okText,
    }
  })
  dialog.$mount()
}

export {
  showMessageDialog, showConfirmDialog, showUpgradeDialog, showDeleteDialog,
  showFormDialog
}
