import { interactionGroups } from "@react-three/rapier";

// Give dynamic bodies distinct memberships so the hidden walls only catch trash.
export const PLAYER_COLLISION_GROUPS = interactionGroups(0);
export const OBSTACLE_COLLISION_GROUPS = interactionGroups(1);
export const OBSTACLE_BOUNDARY_COLLISION_GROUPS = interactionGroups(2, 1);
