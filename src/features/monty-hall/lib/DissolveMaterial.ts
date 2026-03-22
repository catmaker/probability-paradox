import * as THREE from 'three'
import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'

export const DissolveMaterial = shaderMaterial(
  {
    basemap: null,
    progress: 0,
    edgeColor: new THREE.Color('#44aaff'),
  },
  // vertex
  /*glsl*/`
    varying vec2 vUv;
    varying vec3 vPosition;
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // fragment
  /*glsl*/`
    uniform sampler2D basemap;
    uniform float progress;
    uniform vec3 edgeColor;
    varying vec2 vUv;
    varying vec3 vPosition;

    // 간단한 noise
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash(i), hash(i + vec2(1,0)), f.x),
        mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x),
        f.y
      );
    }

    void main() {
      float n = noise(vUv * 8.0 + vPosition.xy * 2.0);
      float threshold = progress;
      if (n < threshold) discard;

      // 엣지 글로우
      float edge = smoothstep(threshold, threshold + 0.08, n);
      vec4 base = basemap != null ? texture2D(basemap, vUv) : vec4(0.1, 0.1, 0.2, 1.0);
      vec3 color = mix(edgeColor, base.rgb, edge);
      gl_FragColor = vec4(color, base.a);
    }
  `
)

extend({ DissolveMaterial })

declare module '@react-three/fiber' {
  interface ThreeElements {
    dissolveMaterial: any
  }
}
