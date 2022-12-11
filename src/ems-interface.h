#include "../frame3dd/src/compat_types.h"
#include "../frame3dd/src/types.h"
#include "../frame3dd/src/core.h"

uint8_t init(const uint16_t nN, const uint16_t nE);

void set_point(uint16_t id, vec3 point, uint8_t is_fixed);

uint8_t init_reactions();

void set_material(const Material mat);

void set_profile(const Profile prof);

void set_element(uint16_t id, uint16_t start_id, uint16_t end_id);

uint8_t init_length();

void set_gravity(float gX, float gY, float gZ);

void init_point_loads(uint8_t number);

void set_point_load(uint8_t id, vec3 axial, vec3 rotational);

void finalize();

uint8_t solve_model();

ResultScope get_result();
