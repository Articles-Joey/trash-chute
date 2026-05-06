import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
// import { ModelAcornMascot } from "../Models/ModelAcornMascot";
import { ModelDumpster } from "../Models/Dumpster";

export default function RotatingMascot() {
    return (
        <div className="rotating-mascot-container w-100 h-100">
            <Canvas>

                <OrbitControls
                    autoRotate
                    enableZoom={false}
                    enablePan={false}
                    enableRotate={false}
                    autoRotateSpeed={10}
                />

                <ambientLight intensity={1} />

                <ModelDumpster scale={2} position={[0, -2, 0]} />

            </Canvas>
        </div>
    );
}