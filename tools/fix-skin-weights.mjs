/**
 * fix-skin-weights.mjs
 *
 * Recalculates skin weights for avatar GLBs using distance-based weighting.
 * Each vertex gets weights proportional to inverse distance² to the nearest bones,
 * with anatomical zone constraints so leg bones can't affect the torso/head.
 *
 * Usage: node tools/fix-skin-weights.mjs [avatar-id]
 *   e.g. node tools/fix-skin-weights.mjs 02
 *        node tools/fix-skin-weights.mjs all
 */
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';

// Anatomical zones: which bones can influence which body region.
// Prevents leg bones from affecting the torso and vice versa.
const ZONES = {
  // Head/neck: only head and neck bones
  head: ['Head','Neck'],
  // Upper torso: spine chain + shoulders + arms
  torso: ['Hips','Spine','Chest','Neck','LeftShoulder','LeftArm','LeftForeArm','LeftHand','RightShoulder','RightArm','RightForeArm','RightHand'],
  // Left arm
  leftArm: ['LeftShoulder','LeftArm','LeftForeArm','LeftHand','Chest'],
  rightArm: ['RightShoulder','RightArm','RightForeArm','RightHand','Chest'],
  // Hip transition zone: hips + upper legs + spine (smooth blend)
  hipTransition: ['Hips','Spine','LeftUpLeg','RightUpLeg'],
  // Left leg: only left leg bones + hips
  leftLeg: ['Hips','LeftUpLeg','LeftLeg','LeftFoot','LeftToe'],
  rightLeg: ['Hips','RightUpLeg','RightLeg','RightFoot','RightToe'],
  // Feet
  leftFoot: ['LeftFoot','LeftToe','LeftLeg'],
  rightFoot: ['RightFoot','RightToe','RightLeg'],
};

function classifyVertex(y, positions, bonePositions) {
  // Thresholds based on bone Y positions
  const hipsY = bonePositions.Hips?.[1] || 0;
  const neckY = bonePositions.Neck?.[1] || 1.4;
  const headY = bonePositions.Head?.[1] || 1.5;
  const spineY = bonePositions.Spine?.[1] || hipsY + 0.15;
  const chestY = bonePositions.Chest?.[1] || spineY + 0.15;

  const leftFootY = bonePositions.LeftFoot?.[1] || 0.08;
  const rightFootY = bonePositions.RightFoot?.[1] || 0.08;
  const leftKneeY = bonePositions.LeftLeg?.[1] || 0.4;

  if (y >= neckY * 0.95) return 'head';
  if (y >= chestY) return 'torso';
  if (y >= hipsY * 0.9 && y < chestY) return 'hipTransition';
  if (y <= Math.max(leftFootY, rightFootY) * 1.8) {
    // Determine left or right by X position
    return positions[0] > 0 ? 'leftFoot' : 'rightFoot';
  }
  if (y < hipsY * 0.9) {
    return positions[0] > 0 ? 'leftLeg' : 'rightLeg';
  }
  return 'torso';
}

function computeBoneSegmentDistance(vx, vy, vz, bone1, bone2) {
  // Distance from point to line segment between two bone positions
  const [ax, ay, az] = bone1;
  const [bx, by, bz] = bone2;
  const dx = bx - ax, dy = by - ay, dz = bz - az;
  const len2 = dx*dx + dy*dy + dz*dz;
  if (len2 < 0.0001) return Math.sqrt((vx-ax)**2 + (vy-ay)**2 + (vz-az)**2);

  let t = ((vx-ax)*dx + (vy-ay)*dy + (vz-az)*dz) / len2;
  t = Math.max(0, Math.min(1, t));
  const px = ax + t*dx, py = ay + t*dy, pz = az + t*dz;
  return Math.sqrt((vx-px)**2 + (vy-py)**2 + (vz-pz)**2);
}

// Bone parent relationships for segment distance
const BONE_PARENT = {
  Spine: 'Hips', Chest: 'Spine', Neck: 'Chest', Head: 'Neck',
  LeftShoulder: 'Chest', LeftArm: 'LeftShoulder', LeftForeArm: 'LeftArm', LeftHand: 'LeftForeArm',
  RightShoulder: 'Chest', RightArm: 'RightShoulder', RightForeArm: 'RightArm', RightHand: 'RightForeArm',
  LeftUpLeg: 'Hips', LeftLeg: 'LeftUpLeg', LeftFoot: 'LeftLeg', LeftToe: 'LeftFoot',
  RightUpLeg: 'Hips', RightLeg: 'RightUpLeg', RightFoot: 'RightLeg', RightToe: 'RightFoot',
};

async function fixWeights(filePath) {
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
  const doc = await io.read(filePath);
  const root = doc.getRoot();

  const skin = root.listSkins()[0];
  if (!skin) { console.log('No skin found in', filePath); return; }

  const joints = skin.listJoints();
  const boneNames = joints.map(j => j.getName());
  const boneIndex = Object.fromEntries(boneNames.map((n, i) => [n, i]));

  // Get bone world positions from inverse bind matrices
  const ibmAccessor = skin.getInverseBindMatrices();
  const ibmData = ibmAccessor.getArray();
  const bonePositions = {};

  for (let i = 0; i < joints.length; i++) {
    // Inverse bind matrix is a 4x4 matrix, column-major
    // The bone position in bind pose is approximately the inverse of the IBM's translation
    const offset = i * 16;
    const m = ibmData.slice(offset, offset + 16);
    // Invert the translation part: the bone position ≈ -transpose(rotation) * translation
    // For a rigid transform, the position is at columns 12,13,14 of the inverse
    // Actually, IBM = inverse(bindMatrix), so bindMatrix = inverse(IBM)
    // Position = inverse(IBM) * [0,0,0,1] which is the last column of inverse(IBM)
    // Simpler: use the IBM directly. The bone world pos is -(R^T * t) where R is upper 3x3, t is col 3
    const tx = m[12], ty = m[13], tz = m[14];
    const px = -(m[0]*tx + m[4]*ty + m[8]*tz);
    const py = -(m[1]*tx + m[5]*ty + m[9]*tz);
    const pz = -(m[2]*tx + m[6]*ty + m[10]*tz);
    bonePositions[boneNames[i]] = [px, py, pz];
  }

  console.log('Bone positions (bind pose):');
  for (const [name, pos] of Object.entries(bonePositions)) {
    console.log(`  ${name}: [${pos.map(v=>v.toFixed(3)).join(', ')}]`);
  }

  const mesh = root.listMeshes()[0];
  if (!mesh) { console.log('No mesh found'); return; }

  let totalFixed = 0;

  for (const prim of mesh.listPrimitives()) {
    const posAttr = prim.getAttribute('POSITION');
    const jointsAttr = prim.getAttribute('JOINTS_0');
    const weightsAttr = prim.getAttribute('WEIGHTS_0');
    if (!posAttr || !jointsAttr || !weightsAttr) continue;

    const vertCount = posAttr.getCount();
    console.log(`Processing ${vertCount} vertices...`);

    for (let vi = 0; vi < vertCount; vi++) {
      const vx = posAttr.getElement(vi, [0,0,0]);
      const x = vx[0], y = vx[1], z = vx[2];

      // Classify vertex into anatomical zone
      const zone = classifyVertex(y, [x, y, z], bonePositions);
      const allowedBones = ZONES[zone] || boneNames;

      // Compute distance to each allowed bone (using bone segments)
      const distances = [];
      for (const boneName of allowedBones) {
        const bi = boneIndex[boneName];
        if (bi === undefined) continue;
        const bonePos = bonePositions[boneName];
        const parentName = BONE_PARENT[boneName];
        const parentPos = parentName ? bonePositions[parentName] : null;

        const dist = parentPos
          ? computeBoneSegmentDistance(x, y, z, bonePos, parentPos)
          : Math.sqrt((x-bonePos[0])**2 + (y-bonePos[1])**2 + (z-bonePos[2])**2);

        distances.push({ index: bi, dist: Math.max(0.001, dist) });
      }

      // Sort by distance, take top 4
      distances.sort((a, b) => a.dist - b.dist);
      const top4 = distances.slice(0, 4);

      // Inverse distance squared weighting
      const sigma = Math.max(0.02, top4[0].dist * 1.5);
      let weights = top4.map(d => Math.exp(-(d.dist * d.dist) / (2 * sigma * sigma)));
      const sum = weights.reduce((s, w) => s + w, 0);
      weights = weights.map(w => w / sum);

      // Pad to 4 entries
      while (top4.length < 4) { top4.push({ index: 0 }); weights.push(0); }

      jointsAttr.setElement(vi, [top4[0].index, top4[1].index, top4[2].index, top4[3].index]);
      weightsAttr.setElement(vi, [weights[0], weights[1], weights[2], weights[3]]);
      totalFixed++;
    }
  }

  console.log(`Fixed ${totalFixed} vertices in ${filePath}`);

  // Write back
  const outPath = filePath;
  await io.write(outPath, doc);
  console.log(`Saved: ${outPath}`);
}

// Main
const target = process.argv[2] || 'all';
const files = target === 'all'
  ? ['02', '03', '04']
  : [target];

for (const id of files) {
  const path = `dist/assets3d/operator-${id}.glb`;
  console.log(`\n=== Processing ${path} ===`);
  await fixWeights(path);
}
console.log('\nDone. Re-deploy to see changes.');
