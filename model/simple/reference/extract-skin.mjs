// Takes the head skin from the realistic model's raw export (Z-Anatomy, CC BY-SA 4.0), simplifies it,
// and saves it as model/simple/reference/head-skin.glb for the Simple model's build.
// Run: node model/simple/reference/extract-skin.mjs typical-raw.glb
import { Document, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { weld, simplify } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const src = await io.read(process.argv[2]);
const node = src.getRoot().listNodes().find((n) => n.getName() === 'skin');
const m = node.getWorldMatrix();
// The skin is stored in several pieces (primitives): join them all.
const positions = [], indices = [];
for (const prim of node.getMesh().listPrimitives()) {
  const pos = prim.getAttribute('POSITION'), idx = prim.getIndices().getArray(), el = [0, 0, 0];
  const base = positions.length / 3;
  for (let i = 0; i < pos.getCount(); i++) {
    pos.getElement(i, el);
    for (let r = 0; r < 3; r++) positions.push(m[r] * el[0] + m[4 + r] * el[1] + m[8 + r] * el[2] + m[12 + r]);
  }
  for (const k of idx) indices.push(base + k);
}
const out = new Float32Array(positions), idx = new Uint32Array(indices);
console.log(node.getMesh().listPrimitives().length, 'pieces,', idx.length / 3, 'triangles before simplifying');
const doc = new Document();
const buf = doc.createBuffer();
const p = doc.createPrimitive()
  .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(out).setBuffer(buf))
  .setIndices(doc.createAccessor().setType('SCALAR').setArray(idx).setBuffer(buf));
doc.createScene().addChild(doc.createNode('skin').setMesh(doc.createMesh('skin').addPrimitive(p)));
await MeshoptSimplifier.ready;
await doc.transform(weld(), simplify({ simplifier: MeshoptSimplifier, ratio: 0.6, error: 0.0002 }));
const n = doc.getRoot().listMeshes()[0].listPrimitives()[0].getIndices().getCount() / 3;
await io.write(new URL('./head-skin.glb', import.meta.url).pathname, doc);
console.log('head-skin.glb:', n, 'triangles');
