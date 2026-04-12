import { useBox } from "@react-three/cannon"
import { useTexture } from "@react-three/drei"
import { RepeatWrapping } from "three"
import { useStore } from "@/hooks/useStore";

export default function Ramp({ args, position, rotation }) {

    const darkMode = useStore(state => state.darkMode);

    const graphicsQuality = useStore(state => state.graphicsQuality);

    const [ref] = useBox(() => ({
        mass: 0,
        type: 'Static',
        args: args,
        position: position,
        rotation: rotation,
    }))

    const sandTextures = useTexture(
        {
            map: '/img/textures/sand/GroundSand005_COL_2K.jpg',
            normalMap: '/img/textures/sand/GroundSand005_NRM_2K.jpg',
            aoMap: '/img/textures/sand/GroundSand005_AO_2K.jpg',
        },
        (textures) => {
            Object.values(textures).forEach(t => {
                t.wrapS = t.wrapT = RepeatWrapping;
                t.repeat.set(2, 20);
            });
        }
    );

    const isLowQuality = graphicsQuality === 'Low';

    return (
        <mesh ref={ref} castShadow>
            <boxGeometry args={args} />
            {isLowQuality ? (
                <meshStandardMaterial color="#d2b48c" />
            ) : (
                <meshStandardMaterial {...sandTextures} />
            )}
        </mesh>
    )

}
