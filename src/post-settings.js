const Frame3dd = {
  init: Module.cwrap('init', 'number', ['number', 'number']),
  set_point: Module.cwrap('set_point', null, ['number', 'number', 'number']),
  init_reactions: Module.cwrap('init_reactions', 'number'),
  set_element: Module.cwrap('set_element', null, [
    'number',
    'number',
    'number'
  ]),
  init_length: Module.cwrap('init_length', 'number'),
  set_gravity: Module.cwrap('set_gravity', null, [
    'number',
    'number',
    'number'
  ]),
  init_point_loads: Module.cwrap('init_point_loads', null, ['number']),
  set_point_load: Module.cwrap('set_point_load', null, [
    'number',
    'array',
    'array'
  ]),
  finalize: Module.cwrap('finalize', null),
  solve_model: Module.cwrap('solve_model', 'number'),
  get_result: Module.cwrap('get_result', 'number'),
  get_context: Module.cwrap('get_context', 'number'),
  get_array: Module.cwrap('get_array', 'number')
}

if (!window.Frame3dd) {
  window.Frame3dd = Frame3dd
}
