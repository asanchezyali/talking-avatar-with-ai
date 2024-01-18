import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { Scenario } from "./components/Sceneario";
import { ChatInterface } from "./components/ChatInterface";

function App() {
  return (
    <>
      <Loader />
      <Leva hidden />
      <ChatInterface />
      <Canvas shadows camera={{ position: [0, 0, 0], fov: 6 }}>
        <Scenario />
      </Canvas>
    </>
  );
}

export default App;
