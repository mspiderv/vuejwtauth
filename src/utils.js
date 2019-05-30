import deepmerge from 'deepmerge'

export function deepMerge (defaultOptions, customOptions) {
  return deepmerge(defaultOptions || {}, customOptions || {}, {
    isMergeableObject (object) {
      return (typeof object === 'object' && object.constructor === Object)
    }
  })
}
