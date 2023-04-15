export = Frame3ddLoader;

declare async function Frame3ddLoader(): Promise<F3DD.Module>;

export interface InputScope {
  points: Array<Point>;
  elements: Array<FrameElement>,
  material: Material;
  profile: Profile;
  gravity: Vec3;
  pointLoads: Array<PointLoad>;
}

export declare namespace F3DD {
  export interface Module {
    calculate: (inputScope: InputScope) => ResultScope;
    inputScopeJSON: InputScope;
  }

  export interface ResultScope {
    context: any;
    result: {
      D: ReadonlyArray<Vec6>;
      R: ReadonlyArray<Vec6>;
      Q: Float64Array;
    };
  }

  type Vec3 = {
    x: number;
    y: number;
    z: number;
  };

  type Vec6 = {
    x: number;
    y: number;
    z: number;
    xx: number;
    yy: number;
    zz: number;
  };

  type Point = Vec3 & {
    /**
     * References a specific node
     */
    id: number;
    /**
     * 1 means node is static
     */
    isFixed: 1 | 0; // enum fixed, ball joint vec[6]
  };

  type FrameElement = {
    id: number;
    /**
     * An ID of the first node
     */
    from: number;
    /**
     * An ID of the second node
     */
    to: number;
  }

  type Material = {
    density: number;
    /**
     * Young's modulus
     */
    E: number;
    /**
     * Sheer modulus (optional)
     */
    G: number;
  };

  export type Profile = {
    /**
     * Cross-section area
     */
    Ax: number;
    Asy: number;
    Asz: number;
    /**
     * Momentum of inertia
     */
    Jx: number;
    Iy: number;
    Iz: number;
  };

  export type PointLoad = {
    id: number;
    axial: [x: number, y: number, z: number];
    rotational: [xx: number, yy: number, zz: number];
  };
}
