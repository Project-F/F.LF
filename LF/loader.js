/*\
 * loader.js
 *
 * loader is a requirejs plugin that loads content packages
\*/

define(['LF/loader-config', 'LF/util', 'core/util'], function (loader_config, util, Futil) {
  return {
    load: function (name, require, load, config) {
      let path = ''
      const content = {}
      let manifest = {}

      if (config.isBuild) {
        load()
        return
      }
      load_package(name)

      function load_package(pack) {
        path = util.normalize_path(pack)
        require([filepath('manifest')], function (mani) {
          manifest = mani
          const manifest_schema =
          {
            data: 'string',
            resourcemap: 'string!optional'
          }
          if (!validate(manifest_schema, manifest)) {
            console.log('loader: error: manifest.js of ' + path + ' is not correct.')
          }
          require([filepath(manifest.data)], load_data)
          load_something('resourcemap')
        })
      }
      function filepath(ppp) {
        if (!ppp) {
          return ''
        }
        if (ppp.lastIndexOf('.js') === ppp.length - 3) {
          ppp = ppp.slice(0, ppp.length - 3)
        }
        const suf = path.indexOf('http') === 0 ? '.js' : ''
        return path + ppp + suf
      }
      function load_data(datalist) {
        function allow_load(folder, obj) {
          if (typeof loader_config.lazyload === 'function') {
            if (!loader_config.lazyload(folder, obj)) {
              return true
            }
          } else {
            return true
          }
        }

        const datafile_depend = []

        for (const i in datalist) {
          if (datalist[i] instanceof Array) {
            for (let j = 0; j < datalist[i].length; j++) {
              if (datalist[i][j].file) {
                if (allow_load(i, datalist[i][j])) {
                  datafile_depend.push(filepath(datalist[i][j].file))
                }
              }
            }
          } else if (typeof datalist[i] === 'object') {
            if (datalist[i].file) {
              if (allow_load(i, datalist[i])) {
                datafile_depend.push(filepath(datalist[i].file))
              }
            }
          }
        }

        require(datafile_depend, function () {
          const gamedata = Futil.extend_object({}, datalist)
          let param = 0

          for (const i in datalist) {
            if (datalist[i] instanceof Array) {
              for (let j = 0; j < datalist[i].length; j++) {
                if (datalist[i][j].file) {
                  if (allow_load(i, datalist[i][j])) {
                    gamedata[i][j].data = arguments[param]
                    param++
                  } else {
                    gamedata[i][j].data = 'lazy'
                  }
                }
              }
            } else if (typeof datalist[i] === 'object') {
              if (datalist[i].file) {
                if (allow_load(i, datalist[i])) {
                  gamedata[i].data = arguments[param]
                  param++
                } else {
                  gamedata[i].data = 'lazy'
                }
              }
            }
          }

          content.data = gamedata
          module_lazyload()
          load_ready()
        })
      }
      function load_something(thing) {
        require([filepath(manifest[thing])], function (it) {
          content[thing] = it
          load_ready()
        })
      }
      function load_ready() {
        const content_schema =
        {
          data: 'object',
          resourcemap: 'object!optional'
        }
        if (validate(content_schema, content)) {
          load(content) // make the require loader return
        }
      }
      function module_lazyload() {	// embed the lazyload module
        if (typeof loader_config.lazyload === 'function') {
          content.data.load = function (sets, ready) {
            const load_list = []
            const res_list = []
            for (const folder in sets) {
              const objects = content.data[folder]
              const ID = sets[folder]
              for (let i = 0; i < ID.length; i++) {
                var O // search for the object
                for (let j = 0; j < objects.length; j++) {
                  if (objects[j].id === ID[i]) {
                    O = objects[j]
                    break
                  }
                }
                if (O && O.file && O.data === 'lazy') {
                  load_list.push(O)
                  res_list.push(filepath(O.file))
                }
              }
            }
            if (res_list.length === 0) {
              setTimeout(ready, 1)
            } else {
              requirejs(res_list, function () {
                for (let i = 0; i < arguments.length; i++) {
                  load_list[i].data = arguments[i]
                }
                ready()
              })
            }
          }
        }
      }

      /** a simple JSON schema validator */
      function validate(schema, object) {
        let good = false
        if (object) {
          good = true
          for (const I in schema) {
            const sss = schema[I].split('!')
            const type = sss[0]
            const option = sss[1] || ''
            if (typeof object[I] === type) {
              // good
            } else if (typeof object[I] === 'undefined' &&
              option && option === 'optional') {
              // still good
            } else {
              good = false
              break
            }
          }
        }
        return good
      }
    },
    normalize: function (name, normalize) {
      return name
    }
  }
})
