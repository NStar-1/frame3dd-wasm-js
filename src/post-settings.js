const init = Module.cwrap('init', 'number', ['number', 'number'])
const setPoint = Module.cwrap('set_point', null, [
  'number',
  'number',
  'number'
])
const initReactions = Module.cwrap('init_reactions', 'number')
const setElement = Module.cwrap('set_element', null, [
  'number',
  'number',
  'number'
])
const initLength = Module.cwrap('init_length', 'number')
const setGravity = Module.cwrap('set_gravity', null, [
  'number',
  'number',
  'number'
])
const initPointLoads = Module.cwrap('init_point_loads', null, ['number'])
const setPointLoad = Module.cwrap('set_point_load', null, [
  'number',
  'number',
  'number'
])
const finalize = Module.cwrap('finalize', null)
const solveModel = Module.cwrap('solve_model', 'number')
const getResult = Module.cwrap('get_result', 'number')
const getContext = Module.cwrap('get_context', 'number')
const getArray = Module.cwrap('get_array', 'number')

function createWasmArray (array, type) {
  let buf

  switch (type) {
    case 'i8':
      array = new Int8Array(array)
      buf = Module._malloc(array.length * array.BYTES_PER_ELEMENT)
      Module.HEAP8.set(array, buf)
      break
    case 'u16':
      array = new Uint16Array(array)
      buf = Module._malloc(array.length * array.BYTES_PER_ELEMENT)
      Module.HEAPU16.set(array, buf)
      break
    case 'f64':
      array = new Float64Array(array)
      buf = Module._malloc(array.length * array.BYTES_PER_ELEMENT)
      Module.HEAPF64.set(array, buf >> 3)
      break
    default:
      throw new Error('Array type is required')
  }

  return buf
}
const inputScopeJSON = {
  nN: 2,
  nE: 1,
  points: [{
    id: 1,
    x: 0, y: 0, z: 0,
    isFixed: 1
  },{
    id: 2,
    x: 1000, y: 0, z: 0,
    isFixed: 0
  }],
  material: {
    density: 7.33e-7, E: 29000, G: 11500 
  },
  profile: {
    Ax: 10, Asy: 1, Asz: 1, Jx: 1, Iy: 1, Iz: .01
  },
  element: {
    id: 1,
    startId: 1,
    endId: 2
  },
  gravity: {
    x: 0, y: -9.8, z: 0
  },
  pointLoad: {
    number: 1,
    id: 1,
    axial: [0, 10, 0],
    rotational: [0, 0, 0]
  }
}

function calculate (inputScope) {
  const {
    nN, nE, points, material, profile, element, gravity, pointLoad
  } = inputScope
  init(nN, nE)
  points.forEach(point =>
    setPoint(point.id, createWasmArray([point.x, point.y, point.z], 'f64'), point.isFixed)
  )
  let err;
  err = initReactions();
  console.error(err)
  Module.set_profile(profile)
  Module.set_material(material)
  setElement(element.id, element.startId, element.endId)
  err = initLength()
  console.error(err)
  setGravity(gravity.x, gravity.y, gravity.z)
  initPointLoads(pointLoad.number)
  setPointLoad(pointLoad.id, createWasmArray(pointLoad.axial, 'f64'), createWasmArray(pointLoad.rotational, 'f64'))
  solveModel()

  return {
    result: Module.get_result(),
    context: Module.get_context()
  }
}

if (!window.Frame3dd) {
  window.Frame3dd = {
    init,
    setPoint,
    initReactions,
    setElement,
    initLength,
    setGravity,
    initPointLoads,
    setPointLoad,
    finalize,
    solveModel,
    getResult,
    getContext,
    getArray,
    calculate,
    inputScopeJSON
  }
}
