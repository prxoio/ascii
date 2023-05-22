// Threejs example: threejs.org/examples/?q=asc#webgl_effects_ascii

import { useEffect, useRef, useState, useMemo, useLayoutEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, useCursor } from '@react-three/drei'
import { AsciiEffect } from 'three-stdlib'
import { useGLTF } from "@react-three/drei";

export default function App() {
  const [showContact, setShowContact] = useState(false);

  return (
    <div>
      <div className="canvas-container">
        <Canvas>
          <color attach="background" args={['black']} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
          <pointLight position={[-10, -10, -10]} />
          <Torusknot />
          {/* <CustomGLTF /> */}
          <OrbitControls />
          <AsciiRenderer fgColor="white" bgColor="black" />
        </Canvas>
      </div>
      {showContact && <ContactPage />}
      <TerminalBar onContactClick={() => setShowContact(!showContact)} />
    </div>
  )
}


function Torusknot(props) {
  const ref = useRef()
  const [clicked, click] = useState(false)
  const [hovered, hover] = useState(false)
  useCursor(hovered)
  useFrame((state, delta) => (ref.current.rotation.x = ref.current.rotation.y += delta / 2))
  return (
    <mesh
      {...props}
      ref={ref}
      scale={clicked ? 1.5 : 1.25}
      onClick={() => click(!clicked)}
      onPointerOver={() => hover(true)}
      onPointerOut={() => hover(false)}>
      <torusKnotGeometry args={[1.2, 0.2, 128, 32]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  )
}

function CustomGLTF(props) {
  //const gltf = useGLTF('./Avocado.gltf'); // Specify the location of your glTF file here
  const gltf = useGLTF(process.env.PUBLIC_URL + '/model.gltf');

  const ref = useRef();
  const [clicked, click] = useState(false);
  const [hovered, hover] = useState(false);

  useCursor(hovered);
//  useFrame((state, delta) => (ref.current.rotation.x = ref.current.rotation.y += delta / 2));
useEffect(() => {
  if (ref.current) {
    ref.current.rotation.x = Math.PI / 2; // Rotate 90 degrees around the Y-axis
  //  ref.current.rotation.z = Math.PI / 0.5; // Rotate 90 degrees around the Y-axis  
    ref.current.position.set(-2.7, 0, 0); // Center the object in the scene

  }
}, []);

useFrame(({ clock }) => {
  const elapsedTime = clock.getElapsedTime(); // Time since clock started in seconds
  ref.current.rotation.z = Math.sin(elapsedTime) * 0.1; // Sway back and forth
});

  return (
    <primitive
      object={gltf.scene}
      {...props}
      ref={ref}
      scale={clicked ? 1.5 : 1.25}
      onClick={() => click(!clicked)}
      onPointerOver={() => hover(true)}
      onPointerOut={() => hover(false)}
    />
  )
}

function TerminalBar({ onContactClick }) {
  return (
    <div className="terminal-bar">
      <div className="label">prxo.io</div>
      <div className="menu-links">
        <div className="contact" onClick={onContactClick}>contact</div>
        {/* <div className="contact">About</div> */}
      </div>
    </div>
  );
}


function AsciiRenderer({
  renderIndex = 1,
  bgColor = 'black',
  fgColor = 'white',
  characters = ' .:-+*=%@#',
  invert = true,
  color = false,
  resolution = 0.17
}) {
  // Reactive state
  const { size, gl, scene, camera } = useThree()

  // Create effect
  const effect = useMemo(() => {
    const effect = new AsciiEffect(gl, characters, { invert, color, resolution })
    effect.domElement.style.position = 'absolute'
    effect.domElement.style.top = '0px'
    effect.domElement.style.left = '0px'
    effect.domElement.style.pointerEvents = 'none'
    return effect
  }, [characters, invert, color, resolution])

  // Styling
  useLayoutEffect(() => {
    effect.domElement.style.color = fgColor
    effect.domElement.style.backgroundColor = bgColor
  }, [fgColor, bgColor])

  // Append on mount, remove on unmount
  useEffect(() => {
    gl.domElement.style.opacity = '0'
    gl.domElement.parentNode.appendChild(effect.domElement)
    return () => {
      gl.domElement.style.opacity = '1'
      gl.domElement.parentNode.removeChild(effect.domElement)
    }
  }, [effect])

  // Set size
  useEffect(() => {
    effect.setSize(size.width, size.height)
  }, [effect, size])

  // Take over render-loop (that is what the index is for)
  useFrame((state) => {
    effect.render(scene, camera)
  }, renderIndex)

  // This component returns nothing, it is a purely logical
}


function ContactPage() {
  return (
    <div className="contact-page">
      <div className="contact-content">
        <p>prxo.io</p>
        <p>email: admin@prxo.io</p>
        <p>phone: +000000000</p>
        <p></p>
      </div>
    </div>
  );
}
