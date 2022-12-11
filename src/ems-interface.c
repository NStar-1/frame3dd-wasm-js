#include "../frame3dd/src/compat_types.h"
#include "../frame3dd/src/types.h"
#include "../frame3dd/src/core.h"

InputScope iscope;
ResultScope rs;
Material material;
Profile profile;
SolverContext ctx = {
	 .rms_resid = 1.0,
	 .error = 1.0,
	 .ok = 1,
	 .iter = 0
};

uint8_t* get_array() {
  static uint8_t arr[3] = {1, 2, 3};
  return arr;
}

uint8_t init(const uint16_t nN, const uint16_t nE) {
	IS_set_nN(&iscope, nN);
	IS_set_nE(&iscope, nE);
	IS_set_nL(&iscope, 1);
	return 0;
}

void set_point(uint16_t id, double point[3], uint8_t is_fixed) {
	iscope.xyz[id].x = point[0];
	iscope.xyz[id].y = point[1];
	iscope.xyz[id].z = point[2];
	iscope.rj[id] = 0;
	for (uint8_t i = 0; i < 6; i++) {
		iscope.r[id * 6 + i] = is_fixed;
	}
}

uint8_t init_reactions() {
	Error *error = NULL;
	error = IS_init_reactions(&iscope);
	if (error != NULL) return error->code;
	return 0;
}

void set_material(const Material mat) {
	material = mat;
}

void set_profile(const Profile prof) {
	profile = prof;
}

void set_element(uint16_t id, uint16_t start_id, uint16_t end_id) {
	iscope.Ax[id]  = profile.Ax;
	iscope.Asy[id] = profile.Asy;
	iscope.Asz[id] = profile.Asz;
	iscope.Jx[id]  = profile.Jx;
	iscope.Iy[id]  = profile.Iy;
	iscope.Iz[id]  = profile.Iz;
	iscope.E[id] = material.E;
	iscope.G[id] = material.G;
	iscope.d[id] = material.density;
	iscope.N1[id] = start_id;
	iscope.N2[id] = end_id;
}

uint8_t init_length() {
	Error *error = NULL;

	error = IS_init_elements_length(&iscope);
	if (error != NULL)
		return error->code;
	return 0;
}

void set_gravity(float gX, float gY, float gZ) {
	// TODO for loop?
	// 1 for load case #1
	iscope.gX[1] = gX;
	iscope.gX[1] = gY;
	iscope.gX[1] = gZ;
	IS_init_eqF_mech(&iscope, 1);
}

void init_point_loads(uint8_t number) {
	// 1 for load case #1
	iscope.nF[1] = number;
}

void set_point_load(uint8_t id, double axial[3], double rotational[3]) {
	// 1 for load case #1
	iscope.F_mech[1][6 * id + 0] = axial[0];
	iscope.F_mech[1][6 * id + 1] = axial[1];
	iscope.F_mech[1][6 * id + 2] = axial[2];
	iscope.F_mech[1][6 * id + 3] = rotational[0];
	iscope.F_mech[1][6 * id + 4] = rotational[1];
	iscope.F_mech[1][6 * id + 5] = rotational[2];
}

void finalize() {
}

uint8_t solve_model() {
	const RuntimeArgs args = {
		.verbose = 1,
		.overrides = {
			.anlyz = 1
		}
	};
	RS_init_for_IS(&rs, &iscope);
	// 1 for Load Case #1
	return solve(iscope, args, ctx, rs, 1);
}

ResultScope get_result() {
	return rs;
}

SolverContext get_context() {
	return ctx;
}
