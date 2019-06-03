import createState from './state'
import createActions from './actions'
import createGetters from './getters'
import createMutations from './mutations'

export default function (auth) {
  return {
    namespaced: auth.options.namespacedModule,

    state: createState(auth),
    actions: createActions(auth),
    getters: createGetters(auth),
    mutations: createMutations(auth),

    // TODO: toto spravit ako funkciu ktora bere `auth` a vracia objekt ktory sa destruktne ?
    ...auth.options.storeModuleExtras
  }
}
