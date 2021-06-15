define({
  lazyload: function (folder, O) {	// return true to delay loading of data files
    if (folder === 'object') {
      switch (O.type) {
        case 'character':
          return true
        case 'specialattack':
          return true
      }
    } else if (folder === 'background') {
      return true
    } else if (folder === 'AI') {
      return true
    }
    return false
  }
})
