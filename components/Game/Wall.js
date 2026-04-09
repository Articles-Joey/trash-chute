import { useStore } from "@/hooks/useStore";
import { useBox } from "@react-three/cannon"
import { useTexture } from "@react-three/drei"
import { RepeatWrapping } from "three"

export default function Wall({ args, position }) {

    const graphicsQuality = useStore(state => state.graphicsQuality);

    const [ref] = useBox(() => ({
        mass: 0,
        type: 'Static',
        args: args,
        position: position,
    }))

    const wallTextures = useTexture(
        {
            map: '/img/textures/wall/StoneBricksSplitface001_COL_2K.jpg',
            normalMap: '/img/textures/wall/StoneBricksSplitface001_NRM_2K.jpg',
            aoMap: '/img/textures/wall/StoneBricksSplitface001_AO_2K.jpg',
        },
        (textures) => {
            Object.values(textures).forEach(t => {
                t.wrapS = t.wrapT = RepeatWrapping;
                t.repeat.set(10, 5);
            });
        }
    );

    const isLowQuality = graphicsQuality === 'Low';

    return (
        <mesh ref={ref} castShadow>
            <boxGeometry args={args} />
            {isLowQuality ? (
                <meshStandardMaterial
                    color="#808080"
                    transparent={true}
                    opacity={0.5}
                />
            ) : (
                <meshStandardMaterial
                    {...wallTextures}
                    transparent={true}
                    opacity={0.5}
                />
            )}
        </mesh>
    )

}
