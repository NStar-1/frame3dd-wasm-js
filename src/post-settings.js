const init = Module.cwrap("init", "number", ["number", "number", "number"]);
const setPoint = Module.cwrap("set_point", null, [
  "number",
  "number",
  "boolean",
  "boolean",
  "boolean",
  "boolean",
  "boolean",
  "boolean",
]);
const initReactions = Module.cwrap("init_reactions", "number");
const setElement = Module.cwrap("set_element", null, [
  "number",
  "number",
  "number",
]);
const initLength = Module.cwrap("init_length", "number");
const setGravity = Module.cwrap("set_gravity", null, [
  "number",
  "number",
  "number",
]);
const initPointLoads = Module.cwrap("init_point_loads", null, ["number"]);
const setPointLoad = Module.cwrap("set_point_load", null, [
  "number",
  "number",
  "number",
]);
const solveModel = Module.cwrap("solve_model", "number");

function createWasmArray(array, type) {
  let buf;

  switch (type) {
    case "i8":
      array = new Int8Array(array);
      buf = Module._malloc(array.length * array.BYTES_PER_ELEMENT);
      Module.HEAP8.set(array, buf);
      break;
    case "u16":
      array = new Uint16Array(array);
      buf = Module._malloc(array.length * array.BYTES_PER_ELEMENT);
      Module.HEAPU16.set(array, buf);
      break;
    case "f64":
      array = new Float64Array(array);
      buf = Module._malloc(array.length * array.BYTES_PER_ELEMENT);
      Module.HEAPF64.set(array, buf >> 3);
      break;
    default:
      throw new Error("Array type is required");
  }

  return buf;
}
const inputScopeJSON = {
  points: [
    {
      id: 1,
      x: 0,
      y: 0,
      z: 0,
      reactions: [true, true, true, true, true, true],
    },
    {
      id: 2,
      x: 500,
      y: 0,
      z: 0,
      reactions: [false, false, false, false, false, false],
    },
    {
      id: 3,
      x: 1000,
      y: 0,
      z: 0,
      reactions: [false, false, false, false, false, false],
    },
  ],
  elements: [
    {
      id: 1,
      from: 1,
      to: 2,
    },
    {
      id: 2,
      from: 2,
      to: 3,
    },
  ],
  material: {
    density: 2.78e-9,
    E: 731000,
    G: 280000,
  },
  profile: {
    Ax: 40.1,
    Asy: 21.3,
    Asz: 21.3,
    Jx: 746,
    Iy: 373,
    Iz: 373,
  },
  gravity: {
    x: 0,
    y: 0,
    z: 0,
  },
  pointLoads: [
    {
      id: 2,
      axial: [0, -10, 0],
      rotational: [0, 0, 0],
    },
  ],
};

function readFile(name) {
  const a = Module.FS.readFile(name);
  return new Float64Array(a.buffer);
}

function calculate(inputScope) {
  // Retrained nodes count
  const restainedNodes = inputScope.points.filter((d) => d.reactions.some((d) => d));
  const nR = restainedNodes.length;
  init(inputScope.points.length, inputScope.elements.length, nR);

  inputScope.points.forEach((point) =>
    setPoint(
      point.id,
      createWasmArray([point.x, point.y, point.z], "f64"),
      ...point.reactions
    )
  );

  let err;

  err = initReactions();
  if (err > 0) console.error(`Init reactions error, code: ${err}`);

  Module.set_profile(inputScope.profile);
  Module.set_material(inputScope.material);

  inputScope.elements.forEach((d) => {
    setElement(d.id, d.from, d.to);
  });

  err = initLength();
  if (err) console.error(`Init length error, code: ${err}`);

  setGravity(inputScope.gravity.x, inputScope.gravity.y, inputScope.gravity.z);
  initPointLoads(inputScope.pointLoads.length);
  inputScope.pointLoads.forEach((pointLoad) => {
    setPointLoad(
      pointLoad.id,
      createWasmArray(pointLoad.axial, "f64"),
      createWasmArray(pointLoad.rotational, "f64")
    );
  });

  err = solveModel();
  if (err) console.log(`Solver error, code: ${err}`);

  const transformResult = (arr) => {
    let counter = 0;
    let groupIndex = 0;
    const mapping = ["x", "y", "z", "xx", "yy", "zz"];
    return arr.reduce(
      (res, curr, index) => {
        const key = mapping[counter++];
        res[groupIndex][key] = curr;
        if (counter === 6 && index < arr.length - 1) {
          counter = 0;
          groupIndex++;
          res.push({});
        }
        return res;
      },
      [{}]
    );
  };

  return {
    context: Module.get_context(),
    result: {
      D: transformResult(readFile("D")),
      R: transformResult(readFile("R")),
      Q: readFile("Q"),
    },
  };
}

Module.calculate = calculate;
Module.inputScopeJSON = inputScopeJSON;

if (!window.Frame3dd) {
  window.Frame3dd = {
    calculate,
    inputScopeJSON,
  };
}
