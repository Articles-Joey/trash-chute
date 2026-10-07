import { useFrame, useThree } from "@react-three/fiber";
import { CapsuleCollider, RigidBody } from "@react-three/rapier";
import {
    useEffect,
    useRef,
    useState,
    memo,
    forwardRef,
    useImperativeHandle,
} from "react";
import { Vector3 } from "three";
import { useKeyboard } from "@/hooks/useKeyboard";
import { useGameStore } from "@/hooks/useGameStore";
import { useControlsStore } from "@/hooks/useControlsStore";
import { Model as SpacesuitModel } from "@/components/Models/Spacesuit";
import { PLAYER_COLLISION_GROUPS } from "./physicsGroups";

const JUMP_FORCE = 6;
const SPEED = 4;
const CONTROLLER_DEADZONE = 0.15;
const LOOK_SENSITIVITY = 0.04;
const THIRD_PERSON_MIN_DISTANCE = 2;
const THIRD_PERSON_MAX_DISTANCE = 20;
const THIRD_PERSON_DEFAULT_DISTANCE = 6;
const THIRD_PERSON_HEIGHT = 0.5;
const CAMERA_GROUND_OFFSET = 0.3;
const SCROLL_SENSITIVITY = 0.5;

function PlayerBase() {
    const setTopCheckpoint = useGameStore((state) => state.setTopCheckpoint);
    const setPlayerBody = useGameStore((state) => state.setPlayerBody);
    const setPosition = useGameStore((state) => state.setPosition);
    const setSprintMeter = useGameStore((state) => state.setSprintMeter);
    const setIsThirdPerson = useGameStore((state) => state.setIsThirdPerson);
    const setCameraDistance = useGameStore((state) => state.setCameraDistance);

    const {
        moveBackward,
        moveForward,
        moveRight,
        moveLeft,
        jump,
        shift,
        crouch,
        cameraView,
    } = useKeyboard();

    const { camera } = useThree();

    const [action, setAction] = useState("Idle");
    const [isJumping, setIsJumping] = useState(false);
    const [isThirdPerson, setIsThirdPersonLocal] = useState(false);

    const prevCameraView = useRef(false);
    const cameraDistanceRef = useRef(THIRD_PERSON_DEFAULT_DISTANCE);
    const modelRef = useRef();
    const groundedFrames = useRef(0);
    const lastJumpTime = useRef(0);
    const lastForwardPressTime = useRef(0);
    const isDoubleTapSprinting = useRef(false);
    const wasMovingForward = useRef(false);
    const knockbackEndTime = useRef(0);
    const explosionRef = useRef(null);

    // Sprint state
    const SPRINT_MAX = 1.5; // seconds of sprint energy
    const SPRINT_COOLDOWN = 5; // seconds before refill starts
    const SPRINT_REFILL = 1; // energy per second (fills in 2s)
    const sprintEnergyRef = useRef(SPRINT_MAX);
    const lastSprintActiveRef = useRef(0); // timestamp of last active sprint frame

    const bodyRef = useRef(null);
    const pos = useRef([0, 1, 0]);

    const handleIntersectionEnter = ({ other }) => {
        if (other.rigidBody?.userData?.topCheckpoint) setTopCheckpoint(true);
    };

    const handleCollisionEnter = ({ other }) => {
        const body = bodyRef.current;
        const userData = other.rigidBody?.userData;
        if (!body || !userData?.obstacle) return;

        // Launch the player when struck by a falling obstacle.
        const isSpikyBall = userData.spikyBall;
        const hForce = isSpikyBall ? 28 : 18;
        const vForce = isSpikyBall ? 20 : 14;
        knockbackEndTime.current = Date.now() + (isSpikyBall ? 800 : 500);
        body.setLinvel(
            {
                x: (Math.random() - 0.5) * hForce,
                y: vForce,
                z: (Math.random() - 0.5) * hForce,
            },
            true,
        );
        if (isSpikyBall && explosionRef.current) {
            const { x, y, z } = body.translation();
            explosionRef.current.trigger([x, y, z]);
        }
    };

    useEffect(() => {
        // YXZ order = yaw first (world Y), then pitch (local X) — prevents gimbal tilt
        camera.rotation.order = "YXZ";
        setPlayerBody(bodyRef.current);
        return () => setPlayerBody(null);
    }, [camera, setPlayerBody]);

    // Toggle third-person on key press (not release)
    useEffect(() => {
        if (cameraView && !prevCameraView.current) {
            setIsThirdPersonLocal((prev) => {
                const next = !prev;
                setIsThirdPerson(next);
                return next;
            });
        }
        prevCameraView.current = cameraView;
    }, [cameraView]);

    // Scroll wheel to adjust third-person camera distance
    useEffect(() => {
        const handleWheel = (e) => {
            cameraDistanceRef.current = Math.min(
                THIRD_PERSON_MAX_DISTANCE,
                Math.max(
                    THIRD_PERSON_MIN_DISTANCE,
                    cameraDistanceRef.current +
                        e.deltaY * SCROLL_SENSITIVITY * 0.01,
                ),
            );
            setCameraDistance(cameraDistanceRef.current);
        };
        document.addEventListener("wheel", handleWheel, { passive: true });
        return () => document.removeEventListener("wheel", handleWheel);
    }, []);

    // Animation state from keyboard
    useEffect(() => {
        if (isJumping) return;
        if (moveLeft || moveRight || moveBackward || moveForward) {
            setAction(shift || isDoubleTapSprinting.current ? "Run" : "Walk");
        } else {
            setAction("Idle");
        }
    }, [moveBackward, moveForward, moveRight, moveLeft, isJumping, shift]);

    useFrame((_, delta) => {
        const body = bodyRef.current;
        if (!body) return;

        let translation = body.translation();
        if (translation.y < -25) {
            body.setTranslation({ x: 0, y: 5, z: 0 }, true);
            body.setLinvel({ x: 0, y: 0, z: 0 }, true);
            knockbackEndTime.current = 0;
            groundedFrames.current = 0;
            setIsJumping(false);
            camera.lookAt(0, 20, 50);
            translation = body.translation();
        }
        pos.current = [translation.x, translation.y, translation.z];
        setPosition([...pos.current]);
        const velocity = body.linvel();

        // --- Camera ---
        if (isThirdPerson) {
            const playerCenter = new Vector3(
                pos.current[0],
                pos.current[1] + THIRD_PERSON_HEIGHT,
                pos.current[2],
            );
            const forward = new Vector3(0, 0, -1).applyEuler(camera.rotation);
            const cameraPos = playerCenter
                .clone()
                .sub(forward.clone().multiplyScalar(cameraDistanceRef.current));
            if (cameraPos.y < CAMERA_GROUND_OFFSET)
                cameraPos.y = CAMERA_GROUND_OFFSET;
            camera.position.copy(cameraPos);
            camera.lookAt(playerCenter);
        } else {
            camera.position.copy(
                new Vector3(
                    pos.current[0],
                    pos.current[1] / (crouch ? 2 : 1) + 0.3,
                    pos.current[2],
                ),
            );
        }

        // Keep model in sync with physics body even during knockback
        if (modelRef.current) {
            modelRef.current.position.set(
                pos.current[0],
                pos.current[1],
                pos.current[2],
            );
        }

        // Suppress movement control while knockback is active
        if (Date.now() < knockbackEndTime.current) return;

        // --- Gamepad input ---
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
        const gamepad = gamepads[0];

        const tc = useControlsStore.getState().touchControls;

        let forwardInput =
            (moveBackward || tc.backward ? 1 : 0) -
            (moveForward || tc.forward ? 1 : 0);
        let sideInput =
            (moveLeft || tc.left ? 1 : 0) - (moveRight || tc.right ? 1 : 0);
        let rotationX = 0;
        let rotationY = 0;

        const isForward = moveForward || tc.forward;
        if (isForward && !wasMovingForward.current) {
            if (Date.now() - lastForwardPressTime.current < 300)
                isDoubleTapSprinting.current = true;
            lastForwardPressTime.current = Date.now();
        }
        if (!isForward) isDoubleTapSprinting.current = false;
        wasMovingForward.current = isForward;

        if (gamepad) {
            const axisX = gamepad.axes[0];
            const axisY = gamepad.axes[1];
            if (Math.abs(axisX) > CONTROLLER_DEADZONE) sideInput -= axisX;
            if (Math.abs(axisY) > CONTROLLER_DEADZONE) forwardInput += axisY;
            const lookX = gamepad.axes[2];
            const lookY = gamepad.axes[3];
            if (Math.abs(lookX) > CONTROLLER_DEADZONE)
                rotationY = -lookX * LOOK_SENSITIVITY;
            if (Math.abs(lookY) > CONTROLLER_DEADZONE)
                rotationX = -lookY * LOOK_SENSITIVITY;
        }

        // Touch look contribution (continuous per-frame, rate = 2 rad/sec at full deflection)
        const TOUCH_LOOK_SENSITIVITY = 2.0;
        if (tc.lookX) rotationY += -tc.lookX * TOUCH_LOOK_SENSITIVITY * delta;
        if (tc.lookY) rotationX += tc.lookY * TOUCH_LOOK_SENSITIVITY * delta;

        if (rotationX !== 0 || rotationY !== 0) {
            camera.rotation.y += rotationY;
            camera.rotation.x = Math.max(
                -Math.PI / 3,
                Math.min(Math.PI / 3, camera.rotation.x + rotationX),
            );
            camera.rotation.z = 0; // prevent roll drift
        }

        const isSprintingInput = shift || isDoubleTapSprinting.current;
        const frontVector = new Vector3(0, 0, forwardInput);
        const sideVector = new Vector3(sideInput, 0, 0);
        const isMoving = frontVector.length() > 0 || sideVector.length() > 0;

        // --- Sprint meter logic ---
        // Use isJumping + knockback as the "airborne" signal — grounded = neither jumping nor knocked back.
        // This correctly handles ramps where Y velocity is non-zero but the player is still on a surface.
        const isGrounded = !isJumping && Date.now() >= knockbackEndTime.current;
        const knockedBack = Date.now() < knockbackEndTime.current;
        const wantSprint =
            isSprintingInput && isMoving && isGrounded && !knockedBack;
        const isSprinting = wantSprint && sprintEnergyRef.current > 0;

        if (isSprinting) {
            sprintEnergyRef.current = Math.max(
                0,
                sprintEnergyRef.current - delta,
            );
            lastSprintActiveRef.current = Date.now();
        } else {
            const idleMs =
                lastSprintActiveRef.current > 0
                    ? Date.now() - lastSprintActiveRef.current
                    : Infinity;
            const onCooldown = idleMs < SPRINT_COOLDOWN * 1000;
            if (!onCooldown) {
                sprintEnergyRef.current = Math.min(
                    SPRINT_MAX,
                    sprintEnergyRef.current + delta * SPRINT_REFILL,
                );
            }
        }

        const sprintNormalized = sprintEnergyRef.current / SPRINT_MAX;
        const sprintOnCooldown =
            lastSprintActiveRef.current > 0 &&
            Date.now() - lastSprintActiveRef.current < SPRINT_COOLDOWN * 1000 &&
            !isSprinting;
        setSprintMeter(sprintNormalized, sprintOnCooldown);

        const direction = new Vector3();
        direction
            .subVectors(frontVector, sideVector)
            .normalize()
            .applyEuler(camera.rotation);
        direction.y = 0;
        direction.normalize().multiplyScalar(SPEED * (isSprinting ? 2 : 1));

        body.setLinvel({ x: direction.x, y: velocity.y, z: direction.z }, true);

        // --- Ground detection ---
        if (Math.abs(velocity.y) < 0.1) {
            groundedFrames.current++;
        } else {
            groundedFrames.current = 0;
        }

        // Landing
        if (
            isJumping &&
            groundedFrames.current > 4 &&
            Date.now() - lastJumpTime.current > 500
        ) {
            setIsJumping(false);
        }

        // Jump
        const isJumpingInput = jump || tc.jump || gamepad?.buttons[0]?.pressed;
        if (isJumpingInput && groundedFrames.current > 2 && !isJumping) {
            body.setLinvel(
                { x: direction.x, y: JUMP_FORCE, z: direction.z },
                true,
            );
            setIsJumping(true);
            lastJumpTime.current = Date.now();
            groundedFrames.current = 0;
            // Consume touch jump so it doesn't re-fire on landing while still held
            if (tc.jump)
                useControlsStore.getState().setTouchControls({ jump: false });
        }

        // Update model rotation based on movement direction
        if (modelRef.current && isMoving) {
            const angle = Math.atan2(direction.x, direction.z);
            modelRef.current.rotation.y = angle;
        }
    });

    return (
        <>
            <RigidBody
                ref={bodyRef}
                position={[0, 1, 0]}
                colliders={false}
                collisionGroups={PLAYER_COLLISION_GROUPS}
                lockRotations
                linearDamping={0}
                friction={0}
                restitution={0}
                ccd
                onCollisionEnter={handleCollisionEnter}
                onIntersectionEnter={handleIntersectionEnter}
            >
                <CapsuleCollider
                    args={[0.5, 0.2]}
                    mass={1}
                />
            </RigidBody>
            <Explosion ref={explosionRef} />
            <group
                ref={modelRef}
                visible={isThirdPerson}
            >
                <SpacesuitModel
                    scale={0.75}
                    position={[0, -0.7, 0]}
                    action={isJumping ? "Jump" : action}
                />
            </group>
        </>
    );
}

export const Player = memo(PlayerBase);

// ---------------------------------------------------------------------------
// Explosion effect — imperative API via forwardRef so PlayerBase can trigger it
// ---------------------------------------------------------------------------

const PARTICLE_COUNT = 24;

const Explosion = forwardRef(function Explosion(_, ref) {
    // Each particle: { position, velocity, life, maxLife }
    const particles = useRef([]);
    const meshRefs = useRef([]);
    const active = useRef(false);

    useImperativeHandle(
        ref,
        () => ({
            trigger(origin) {
                active.current = true;
                particles.current = Array.from(
                    { length: PARTICLE_COUNT },
                    () => {
                        const theta = Math.random() * Math.PI * 2;
                        const phi = Math.random() * Math.PI;
                        const speed = 4 + Math.random() * 8;
                        return {
                            position: [...origin],
                            velocity: [
                                Math.sin(phi) * Math.cos(theta) * speed,
                                Math.sin(phi) * Math.sin(theta) * speed,
                                Math.cos(phi) * speed,
                            ],
                            life: 1,
                        };
                    },
                );
            },
        }),
        [],
    );

    useFrame((_, delta) => {
        if (!active.current) return;

        let allDead = true;
        particles.current.forEach((p, i) => {
            if (p.life <= 0) return;
            allDead = false;

            p.life -= delta * 1.8;
            p.position[0] += p.velocity[0] * delta;
            p.position[1] += p.velocity[1] * delta;
            p.position[2] += p.velocity[2] * delta;
            p.velocity[1] -= 9.8 * delta; // gravity

            const mesh = meshRefs.current[i];
            if (mesh) {
                mesh.position.set(...p.position);
                const t = Math.max(0, p.life);
                mesh.scale.setScalar(t * 0.3);
                mesh.material.opacity = t;
                mesh.material.emissiveIntensity = t * 4;
            }
        });

        if (allDead) active.current = false;
    });

    return (
        <group>
            {Array.from({ length: PARTICLE_COUNT }, (_, i) => (
                <mesh
                    key={i}
                    ref={(el) => (meshRefs.current[i] = el)}
                    scale={0}
                >
                    <sphereGeometry args={[1, 6, 6]} />
                    <meshStandardMaterial
                        color="#ff4400"
                        emissive="#ff8800"
                        emissiveIntensity={4}
                        transparent
                        opacity={1}
                        depthWrite={false}
                    />
                </mesh>
            ))}
        </group>
    );
});
